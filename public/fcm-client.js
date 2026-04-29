/* Client-side FCM HTTP v1 sender.
   Uses the service account JSON (already in browser) to:
   1. Sign a JWT with the private key (RSA-SHA256) via Web Crypto.
   2. Exchange JWT for an OAuth2 access token from oauth2.googleapis.com.
   3. POST to fcm.googleapis.com/v1/projects/{projectId}/messages:send.
   Tokens are cached in memory per project for 55 minutes. */

const TOKEN_CACHE = new Map();
const TOKEN_TTL_MS = 55 * 60 * 1000;

function base64UrlEncode(bytes) {
  let binary = "";
  if (typeof bytes === "string") {
    binary = unescape(encodeURIComponent(bytes));
  } else {
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToArrayBuffer(pem) {
  const cleaned = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function importPrivateKey(pem) {
  return crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(pem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function createSignedJwt(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: serviceAccount.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const claimB64 = base64UrlEncode(JSON.stringify(claim));
  const unsigned = `${headerB64}.${claimB64}`;

  const privateKey = await importPrivateKey(serviceAccount.private_key);
  const signatureBuffer = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    privateKey,
    new TextEncoder().encode(unsigned)
  );
  const signatureB64 = base64UrlEncode(new Uint8Array(signatureBuffer));
  return `${unsigned}.${signatureB64}`;
}

async function fetchAccessToken(serviceAccount) {
  const cacheKey = serviceAccount.client_email;
  const cached = TOKEN_CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  const jwt = await createSignedJwt(serviceAccount);
  const tokenUrl = serviceAccount.token_uri || "https://oauth2.googleapis.com/token";

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    const reason =
      data.error_description ||
      data.error ||
      `HTTP ${response.status}`;
    throw new Error(`Failed to get access token: ${reason}`);
  }

  TOKEN_CACHE.set(cacheKey, {
    token: data.access_token,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  });
  return data.access_token;
}

async function sendSingle({ projectId, accessToken, message }) {
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const reason =
      data?.error?.message ||
      data?.error?.status ||
      `HTTP ${response.status}`;
    return { success: false, error: reason, raw: data };
  }
  return { success: true, name: data.name, raw: data };
}

function buildMessageFromSimple({ title, body, imageUrl, dataPayload, priority }) {
  const fcmPriority = priority === "NORMAL" ? "normal" : "high";
  const message = {
    notification: { title, body },
    android: {
      priority: fcmPriority,
      notification: { sound: "default" },
    },
    apns: {
      headers: { "apns-priority": fcmPriority === "high" ? "10" : "5" },
      payload: { aps: { sound: "default" } },
    },
  };
  if (imageUrl) {
    message.notification.image = imageUrl;
  }
  if (dataPayload && typeof dataPayload === "object") {
    message.data = Object.fromEntries(
      Object.entries(dataPayload).map(([k, v]) => [k, String(v)])
    );
  }
  return message;
}

async function sendNotification(options) {
  const {
    serviceAccount,
    mode = "simple",
    targetType,
    targets,
    simple,
    rawMessage,
  } = options;

  if (!serviceAccount?.private_key || !serviceAccount?.client_email || !serviceAccount?.project_id) {
    throw new Error("Invalid service account JSON.");
  }
  if (!targetType) {
    throw new Error("targetType is required.");
  }
  if (!targets || !targets.length) {
    throw new Error("Target value is required.");
  }

  const projectId = serviceAccount.project_id;
  const accessToken = await fetchAccessToken(serviceAccount);

  const baseMessage =
    mode === "custom" ? sanitizeCustomMessage(rawMessage) : buildMessageFromSimple(simple || {});

  if (targetType === "topic") {
    const topic = targets[0];
    const message = { ...baseMessage, topic };
    const result = await sendSingle({ projectId, accessToken, message });
    return {
      success: result.success,
      projectName: projectId,
      targetType: "topic",
      topic,
      messageId: result.name,
      error: result.error || null,
      raw: result.raw,
    };
  }

  if (targetType === "token") {
    if (targets.length === 1) {
      const message = { ...baseMessage, token: targets[0] };
      const result = await sendSingle({ projectId, accessToken, message });
      return {
        success: result.success,
        projectName: projectId,
        targetType: "token",
        successCount: result.success ? 1 : 0,
        failureCount: result.success ? 0 : 1,
        messageId: result.name,
        error: result.error || null,
        raw: result.raw,
      };
    }

    const results = await Promise.all(
      targets.map(async (token) => {
        const message = { ...baseMessage, token };
        const r = await sendSingle({ projectId, accessToken, message });
        return { token, ...r };
      })
    );

    const successCount = results.filter((r) => r.success).length;
    const failures = results
      .filter((r) => !r.success)
      .map((r) => ({ token: r.token, error: r.error }));

    return {
      success: failures.length === 0,
      projectName: projectId,
      targetType: "token",
      successCount,
      failureCount: failures.length,
      failures,
    };
  }

  throw new Error("targetType must be either token or topic.");
}

function sanitizeCustomMessage(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Custom payload must be a JSON object.");
  }
  const copy = { ...raw };
  delete copy.token;
  delete copy.tokens;
  delete copy.topic;
  delete copy.condition;
  return copy;
}

window.fcmClient = { sendNotification };
