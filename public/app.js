const STORAGE_KEY = "fcm-saved-projects-v1";
const ACTIVE_PROJECT_KEY = "fcm-active-project-id-v1";
const HISTORY_KEY = "fcm-history-v1";
const THEME_KEY = "fcm-theme-v1";
const WELCOME_SEEN_KEY = "fcm-welcome-seen-v1";
const MAX_HISTORY = 50;

const elements = {
  projectForm: document.getElementById("projectForm"),
  projectAlias: document.getElementById("projectAlias"),
  serviceAccountUpload: document.getElementById("serviceAccountUpload"),
  serviceAccountField: document.getElementById("serviceAccountField"),
  projectList: document.getElementById("projectList"),
  projectCount: document.getElementById("projectCount"),
  projectSearch: document.getElementById("projectSearch"),
  openAddProjectBtn: document.getElementById("openAddProjectBtn"),
  modalBackdrop: document.getElementById("modalBackdrop"),
  modalCloseBtn: document.getElementById("modalCloseBtn"),
  modalCancelBtn: document.getElementById("modalCancelBtn"),
  modalSaveBtn: document.getElementById("modalSaveBtn"),
  modalTitle: document.getElementById("modalTitle"),
  activeProjectTitle: document.getElementById("activeProjectTitle"),
  activeProjectSubtitle: document.getElementById("activeProjectSubtitle"),
  connectionPill: document.getElementById("connectionPill"),
  projectName: document.getElementById("projectName"),
  targetType: document.getElementById("targetType"),
  targetValue: document.getElementById("targetValue"),
  targetValueLabel: document.getElementById("targetValueLabel"),
  priority: document.getElementById("priority"),
  title: document.getElementById("title"),
  body: document.getElementById("body"),
  imageUrl: document.getElementById("imageUrl"),
  dataPayload: document.getElementById("dataPayload"),
  sendButton: document.getElementById("sendButton"),
  sendButtonText: document.getElementById("sendButtonText"),
  fcmForm: document.getElementById("fcmForm"),
  resultCard: document.getElementById("resultCard"),
  result: document.getElementById("result"),
  resultTitle: document.getElementById("resultTitle"),
  copyResultBtn: document.getElementById("copyResultBtn"),
  toastContainer: document.getElementById("toastContainer"),
  themeToggle: document.getElementById("themeToggle"),
  exportBtn: document.getElementById("exportBtn"),
  importInput: document.getElementById("importInput"),
  tabs: document.querySelectorAll(".tab-btn"),
  tabPanels: document.querySelectorAll(".tab-panel"),
  historyList: document.getElementById("historyList"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),
  modeButtons: document.querySelectorAll(".mode-btn"),
  simpleWrap: document.querySelector(".simple-fields-wrap"),
  customWrap: document.querySelector(".custom-fields-wrap"),
  customTargetType: document.getElementById("customTargetType"),
  customTargetValue: document.getElementById("customTargetValue"),
  rawPayload: document.getElementById("rawPayload"),
  templateButtons: document.querySelectorAll("[data-template]"),
  formatJsonBtn: document.getElementById("formatJsonBtn"),
  validateJsonBtn: document.getElementById("validateJsonBtn"),
  helpBtn: document.getElementById("helpBtn"),
  welcomeBackdrop: document.getElementById("welcomeBackdrop"),
  welcomeCloseBtn: document.getElementById("welcomeCloseBtn"),
  dontShowAgain: document.getElementById("dontShowAgain"),
};

const state = {
  projects: [],
  activeProjectId: null,
  searchQuery: "",
  history: [],
  editingProjectId: null,
  composeMode: "simple",
};

const PAYLOAD_TEMPLATES = {
  basic: {
    notification: {
      title: "Hello",
      body: "This is a basic notification",
    },
  },
  data: {
    notification: {
      title: "Order shipped",
      body: "Your order #12345 is on its way",
    },
    data: {
      orderId: "12345",
      type: "order_update",
      url: "https://example.com/orders/12345",
    },
  },
  android: {
    notification: {
      title: "Android notification",
      body: "With channel and priority",
    },
    android: {
      priority: "high",
      notification: {
        channelId: "default",
        sound: "default",
        clickAction: "OPEN_ACTIVITY",
        color: "#4f46e5",
      },
    },
  },
  apns: {
    notification: {
      title: "iOS notification",
      body: "With APNs options",
    },
    apns: {
      headers: {
        "apns-priority": "10",
      },
      payload: {
        aps: {
          sound: "default",
          badge: 1,
          "mutable-content": 1,
        },
      },
    },
  },
  webpush: {
    notification: {
      title: "Web push",
      body: "With actions",
    },
    webpush: {
      headers: {
        TTL: "300",
      },
      notification: {
        icon: "https://example.com/icon.png",
        actions: [
          { action: "open", title: "Open" },
          { action: "dismiss", title: "Dismiss" },
        ],
      },
    },
  },
};

/* ---------- Storage ---------- */
function loadFromStorage(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (_) {
    return fallback;
  }
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.projects));
}

function saveActiveProjectId() {
  if (state.activeProjectId) {
    localStorage.setItem(ACTIVE_PROJECT_KEY, state.activeProjectId);
  } else {
    localStorage.removeItem(ACTIVE_PROJECT_KEY);
  }
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history.slice(0, MAX_HISTORY)));
}

/* ---------- Toast ---------- */
function showToast(type, title, message = "") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-body">
      <strong>${title}</strong>
      ${message ? `<span>${escapeHtml(message)}</span>` : ""}
    </div>
  `;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    toast.style.transition = "all 0.2s ease";
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

/* ---------- Modal ---------- */
function openModal(projectIdToEdit = null) {
  state.editingProjectId = projectIdToEdit;
  elements.modalBackdrop.classList.remove("hidden");

  if (projectIdToEdit) {
    const project = state.projects.find((p) => p.id === projectIdToEdit);
    if (project) {
      elements.modalTitle.textContent = "Edit Project";
      elements.projectAlias.value = project.alias;
      elements.serviceAccountField.style.display = "none";
      elements.serviceAccountUpload.required = false;
      elements.modalSaveBtn.textContent = "Update";
    }
  } else {
    elements.modalTitle.textContent = "Add Project";
    elements.projectForm.reset();
    elements.serviceAccountField.style.display = "";
    elements.serviceAccountUpload.required = true;
    elements.modalSaveBtn.textContent = "Save";
  }

  setTimeout(() => elements.projectAlias.focus(), 50);
}

function closeModal() {
  elements.modalBackdrop.classList.add("hidden");
  elements.projectForm.reset();
  state.editingProjectId = null;
}

/* ---------- Render ---------- */
function getInitials(text) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function renderProjects() {
  const filtered = state.projects.filter((p) => {
    const q = state.searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.alias.toLowerCase().includes(q) ||
      p.projectId.toLowerCase().includes(q)
    );
  });

  elements.projectCount.textContent = String(state.projects.length);
  elements.projectList.innerHTML = "";

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = state.searchQuery
      ? "No matching projects"
      : "No projects yet. Click Add Project to begin.";
    elements.projectList.appendChild(empty);
    return;
  }

  filtered.forEach((project) => {
    const row = document.createElement("div");
    row.className = `project-item ${project.id === state.activeProjectId ? "active" : ""}`;

    const meta = document.createElement("div");
    meta.className = "project-meta";
    meta.addEventListener("click", () => setActiveProject(project.id));

    const avatar = document.createElement("div");
    avatar.className = "project-avatar";
    avatar.textContent = getInitials(project.alias || project.projectId);

    const text = document.createElement("div");
    text.className = "project-text";
    text.innerHTML = `<strong>${escapeHtml(project.alias)}</strong><span>${escapeHtml(project.projectId)}</span>`;

    meta.appendChild(avatar);
    meta.appendChild(text);

    const actions = document.createElement("div");
    actions.className = "project-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "icon-btn small";
    editBtn.title = "Rename";
    editBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(project.id);
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "danger-btn";
    removeBtn.textContent = "Delete";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!confirm(`Delete "${project.alias}"? This removes its JSON from this browser.`)) return;
      deleteProject(project.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(removeBtn);

    row.appendChild(meta);
    row.appendChild(actions);
    elements.projectList.appendChild(row);
  });
}

function renderActiveProject() {
  const project = getActiveProject();
  if (!project) {
    elements.activeProjectTitle.textContent = "No project selected";
    elements.activeProjectSubtitle.textContent = "Add or select a project to start sending notifications.";
    elements.projectName.value = "";
    elements.sendButton.disabled = true;
    elements.connectionPill.textContent = "Idle";
    elements.connectionPill.className = "status-pill status-idle";
    return;
  }

  elements.activeProjectTitle.textContent = project.alias;
  elements.activeProjectSubtitle.textContent = `Project ID: ${project.projectId}`;
  elements.projectName.value = project.projectId;
  elements.sendButton.disabled = false;
  elements.connectionPill.textContent = "Ready";
  elements.connectionPill.className = "status-pill status-success";
}

function renderHistory() {
  elements.historyList.innerHTML = "";
  if (!state.history.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No notifications sent yet from this browser.";
    elements.historyList.appendChild(empty);
    return;
  }

  state.history.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "history-item";

    const status = document.createElement("div");
    status.className = `history-status ${entry.success ? "ok" : "fail"}`;
    status.innerHTML = entry.success
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

    const content = document.createElement("div");
    content.className = "history-content";
    content.innerHTML = `<strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(entry.projectAlias)} • ${escapeHtml(entry.targetType)} • ${escapeHtml(entry.summary)}</span>`;

    const time = document.createElement("div");
    time.className = "history-time";
    time.textContent = formatDate(entry.timestamp);

    row.appendChild(status);
    row.appendChild(content);
    row.appendChild(time);
    elements.historyList.appendChild(row);
  });
}

function formatDate(ts) {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now - date;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return date.toLocaleString();
}

function render() {
  renderProjects();
  renderActiveProject();
  renderHistory();
  updateTargetLabel();
}

/* ---------- Project ops ---------- */
function getActiveProject() {
  return state.projects.find((p) => p.id === state.activeProjectId) || null;
}

function setActiveProject(projectId) {
  state.activeProjectId = projectId;
  saveActiveProjectId();
  render();
}

function deleteProject(projectId) {
  state.projects = state.projects.filter((p) => p.id !== projectId);
  if (state.activeProjectId === projectId) {
    state.activeProjectId = state.projects[0]?.id || null;
  }
  saveProjects();
  saveActiveProjectId();
  showToast("success", "Project removed");
  render();
}

/* ---------- Add/Edit Project ---------- */
elements.projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const alias = elements.projectAlias.value.trim();
  if (!alias) return;

  if (state.editingProjectId) {
    const project = state.projects.find((p) => p.id === state.editingProjectId);
    if (project) {
      project.alias = alias;
      saveProjects();
      showToast("success", "Project updated");
      closeModal();
      render();
    }
    return;
  }

  const file = elements.serviceAccountUpload.files?.[0];
  if (!file) {
    showToast("error", "Service account JSON required");
    return;
  }

  try {
    const text = await file.text();
    const json = JSON.parse(text);
    if (!json.project_id) {
      showToast("error", "Invalid JSON", "Missing project_id field.");
      return;
    }

    if (state.projects.some((p) => p.projectId === json.project_id)) {
      const ok = confirm(`A project with id "${json.project_id}" already exists. Add another?`);
      if (!ok) return;
    }

    const project = {
      id: crypto.randomUUID(),
      alias,
      projectId: json.project_id,
      clientEmail: json.client_email || "",
      credentialsJson: JSON.stringify(json),
      createdAt: Date.now(),
    };

    state.projects.push(project);
    saveProjects();
    setActiveProject(project.id);
    showToast("success", "Project saved", `${alias} (${json.project_id})`);
    closeModal();
  } catch (error) {
    showToast("error", "Invalid JSON file", error.message);
  }
});

/* ---------- Send notification ---------- */
elements.fcmForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const project = getActiveProject();
  if (!project) {
    showToast("warning", "Select a project first");
    return;
  }

  if (state.composeMode === "custom") {
    await sendCustomPayload(project);
  } else {
    await sendSimplePayload(project);
  }
});

function parseTargets(targetType, raw) {
  if (targetType === "topic") {
    return [raw];
  }
  return raw
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

async function sendSimplePayload(project) {
  const targetType = elements.targetType.value;
  const targetRaw = elements.targetValue.value.trim();
  const title = elements.title.value.trim();
  const body = elements.body.value.trim();
  const imageUrl = elements.imageUrl.value.trim();
  const priority = elements.priority.value;
  const dataPayloadRaw = elements.dataPayload.value.trim();

  if (!targetRaw || !title || !body) {
    showToast("warning", "Missing fields", "Target, title and body are required.");
    return;
  }

  let dataPayload = null;
  if (dataPayloadRaw) {
    try {
      dataPayload = JSON.parse(dataPayloadRaw);
      if (typeof dataPayload !== "object" || Array.isArray(dataPayload) || dataPayload === null) {
        throw new Error("Data payload must be a JSON object.");
      }
      Object.entries(dataPayload).forEach(([k, v]) => {
        if (typeof v !== "string") {
          dataPayload[k] = String(v);
        }
      });
    } catch (error) {
      showToast("error", "Invalid Data Payload", error.message);
      return;
    }
  }

  const targets = parseTargets(targetType, targetRaw);

  setSending(true);
  showResult("loading", "Sending...", "Signing JWT and contacting Firebase Cloud Messaging...");

  try {
    const serviceAccount = JSON.parse(project.credentialsJson);
    const result = await window.fcmClient.sendNotification({
      serviceAccount,
      mode: "simple",
      targetType,
      targets,
      simple: { title, body, imageUrl, dataPayload, priority },
    });
    handleSendResult(result, { project, title, targetType });
  } catch (error) {
    handleSendError(error, { project, title, targetType });
  } finally {
    setSending(false);
  }
}

async function sendCustomPayload(project) {
  const targetType = elements.customTargetType.value;
  const targetRaw = elements.customTargetValue.value.trim();
  const rawPayload = elements.rawPayload.value.trim();

  if (!targetRaw) {
    showToast("warning", "Target required", "Enter a token or topic.");
    return;
  }
  if (!rawPayload) {
    showToast("warning", "Payload required", "Add a JSON message body.");
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(rawPayload);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("Payload must be a JSON object.");
    }
  } catch (error) {
    showToast("error", "Invalid JSON", error.message);
    return;
  }

  const targets = parseTargets(targetType, targetRaw);

  const titleForHistory =
    parsed?.notification?.title ||
    parsed?.android?.notification?.title ||
    parsed?.apns?.payload?.aps?.alert?.title ||
    "Custom payload";

  setSending(true);
  showResult("loading", "Sending...", "Signing JWT and sending custom payload...");

  try {
    const serviceAccount = JSON.parse(project.credentialsJson);
    const result = await window.fcmClient.sendNotification({
      serviceAccount,
      mode: "custom",
      targetType,
      targets,
      rawMessage: parsed,
    });
    handleSendResult(result, { project, title: titleForHistory, targetType });
  } catch (error) {
    handleSendError(error, { project, title: titleForHistory, targetType });
  } finally {
    setSending(false);
  }
}

function handleSendResult(result, ctx) {
  if (!result.success) {
    const message = result.error || formatSendSummary(result) || "Send failed";
    showResult("error", "Failed to send", JSON.stringify(result, null, 2));
    showToast("error", "Send failed", message);
    addHistory({
      success: false,
      title: ctx.title,
      projectAlias: ctx.project.alias,
      targetType: ctx.targetType,
      summary: message,
    });
    return;
  }

  const summary = formatSendSummary(result);
  showResult("success", "Sent successfully", JSON.stringify(result, null, 2));
  showToast("success", "Notification sent", summary);
  addHistory({
    success: true,
    title: ctx.title,
    projectAlias: ctx.project.alias,
    targetType: ctx.targetType,
    summary,
  });
}

function handleSendError(error, ctx) {
  const message = error?.message || String(error);
  showResult("error", "Send error", message);
  showToast("error", "Send error", message);
  addHistory({
    success: false,
    title: ctx.title,
    projectAlias: ctx.project.alias,
    targetType: ctx.targetType,
    summary: message,
  });
}

function formatSendSummary(data) {
  if (data?.successCount !== undefined) {
    return `Success: ${data.successCount}, Failure: ${data.failureCount}`;
  }
  if (data?.messageId) {
    return `Message ID: ${data.messageId}`;
  }
  if (data?.name) {
    return `Message: ${data.name}`;
  }
  return "Done";
}

function setSending(isSending) {
  elements.sendButton.disabled = isSending;
  elements.sendButtonText.textContent = isSending ? "Sending..." : "Send Notification";
  if (isSending) {
    elements.connectionPill.textContent = "Sending";
    elements.connectionPill.className = "status-pill status-sending";
  } else {
    const project = getActiveProject();
    if (project) {
      elements.connectionPill.textContent = "Ready";
      elements.connectionPill.className = "status-pill status-success";
    }
  }
}

function showResult(type, title, content) {
  elements.resultCard.classList.remove("hidden");
  elements.resultTitle.textContent = title;
  elements.result.textContent = content;
}

function addHistory(entry) {
  state.history.unshift({ ...entry, timestamp: Date.now() });
  state.history = state.history.slice(0, MAX_HISTORY);
  saveHistory();
  renderHistory();
}

/* ---------- Mode switch (Simple / Custom) ---------- */
elements.modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;
    state.composeMode = mode;

    elements.modeButtons.forEach((b) => {
      const isActive = b === btn;
      b.classList.toggle("active", isActive);
      b.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    elements.simpleWrap.classList.toggle("hidden", mode !== "simple");
    elements.customWrap.classList.toggle("hidden", mode !== "custom");

    if (mode === "custom" && !elements.rawPayload.value.trim()) {
      elements.rawPayload.value = JSON.stringify(PAYLOAD_TEMPLATES.basic, null, 2);
    }
  });
});

elements.templateButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tpl = PAYLOAD_TEMPLATES[btn.dataset.template];
    if (!tpl) return;
    if (
      elements.rawPayload.value.trim() &&
      !confirm("Replace current payload with this template?")
    ) {
      return;
    }
    elements.rawPayload.value = JSON.stringify(tpl, null, 2);
    showToast("success", "Template loaded", btn.textContent);
  });
});

elements.formatJsonBtn.addEventListener("click", () => {
  const value = elements.rawPayload.value.trim();
  if (!value) return;
  try {
    elements.rawPayload.value = JSON.stringify(JSON.parse(value), null, 2);
    showToast("success", "Formatted");
  } catch (error) {
    showToast("error", "Invalid JSON", error.message);
  }
});

elements.validateJsonBtn.addEventListener("click", () => {
  const value = elements.rawPayload.value.trim();
  if (!value) return;
  try {
    JSON.parse(value);
    showToast("success", "Valid JSON");
  } catch (error) {
    showToast("error", "Invalid JSON", error.message);
  }
});

/* ---------- Tabs ---------- */
elements.tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    elements.tabs.forEach((b) => b.classList.toggle("active", b === btn));
    elements.tabs.forEach((b) => b.setAttribute("aria-selected", b === btn ? "true" : "false"));
    const target = btn.dataset.tab;
    elements.tabPanels.forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.panel !== target);
    });
  });
});

/* ---------- Target type dynamic label ---------- */
elements.targetType.addEventListener("change", updateTargetLabel);
function updateTargetLabel() {
  if (elements.targetType.value === "topic") {
    elements.targetValueLabel.textContent = "Topic Name";
    elements.targetValue.placeholder = "e.g. news";
  } else {
    elements.targetValueLabel.textContent = "Device Tokens (comma or newline separated)";
    elements.targetValue.placeholder = "token1, token2, token3";
  }
}

/* ---------- Misc events ---------- */
elements.openAddProjectBtn.addEventListener("click", () => openModal(null));
elements.modalCloseBtn.addEventListener("click", closeModal);
elements.modalCancelBtn.addEventListener("click", closeModal);
elements.modalBackdrop.addEventListener("click", (e) => {
  if (e.target === elements.modalBackdrop) closeModal();
});

elements.projectSearch.addEventListener("input", (e) => {
  state.searchQuery = e.target.value;
  renderProjects();
});

elements.copyResultBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(elements.result.textContent || "");
    showToast("success", "Copied to clipboard");
  } catch (_) {
    showToast("error", "Copy failed");
  }
});

elements.clearHistoryBtn.addEventListener("click", () => {
  if (!state.history.length) return;
  if (!confirm("Clear all notification history?")) return;
  state.history = [];
  saveHistory();
  renderHistory();
});

/* ---------- Theme ---------- */
elements.themeToggle.addEventListener("click", () => {
  const current = document.body.dataset.theme;
  const next = current === "dark" ? "light" : "dark";
  document.body.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
});

/* ---------- Export / Import ---------- */
elements.exportBtn.addEventListener("click", () => {
  if (!state.projects.length) {
    showToast("warning", "No projects to export");
    return;
  }
  const blob = new Blob([JSON.stringify(state.projects, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fcm-projects-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("success", "Exported", `${state.projects.length} project(s)`);
});

elements.importInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const imported = JSON.parse(text);
    if (!Array.isArray(imported)) throw new Error("Invalid backup format.");

    let added = 0;
    imported.forEach((p) => {
      if (!p.projectId || !p.credentialsJson || !p.alias) return;
      if (state.projects.some((existing) => existing.projectId === p.projectId)) return;
      state.projects.push({
        id: crypto.randomUUID(),
        alias: p.alias,
        projectId: p.projectId,
        clientEmail: p.clientEmail || "",
        credentialsJson: p.credentialsJson,
        createdAt: p.createdAt || Date.now(),
      });
      added += 1;
    });

    saveProjects();
    render();
    showToast("success", "Imported", `${added} new project(s) added`);
  } catch (error) {
    showToast("error", "Import failed", error.message);
  } finally {
    event.target.value = "";
  }
});

/* ---------- Init ---------- */
/* ---------- Welcome modal ---------- */
function openWelcome() {
  if (!elements.welcomeBackdrop) return;
  elements.welcomeBackdrop.classList.remove("hidden");
}

function closeWelcome() {
  if (!elements.welcomeBackdrop) return;
  elements.welcomeBackdrop.classList.add("hidden");
  if (elements.dontShowAgain?.checked) {
    localStorage.setItem(WELCOME_SEEN_KEY, "1");
  } else {
    localStorage.removeItem(WELCOME_SEEN_KEY);
  }
}

elements.helpBtn?.addEventListener("click", () => {
  if (elements.dontShowAgain) elements.dontShowAgain.checked = true;
  openWelcome();
});

elements.welcomeCloseBtn?.addEventListener("click", closeWelcome);
elements.welcomeBackdrop?.addEventListener("click", (e) => {
  if (e.target === elements.welcomeBackdrop) closeWelcome();
});

function init() {
  state.projects = loadFromStorage(STORAGE_KEY, []);
  state.history = loadFromStorage(HISTORY_KEY, []);
  const savedActive = localStorage.getItem(ACTIVE_PROJECT_KEY);
  state.activeProjectId =
    savedActive && state.projects.some((p) => p.id === savedActive)
      ? savedActive
      : state.projects[0]?.id || null;

  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    document.body.dataset.theme = savedTheme;
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.dataset.theme = "dark";
  }

  render();

  if (!localStorage.getItem(WELCOME_SEEN_KEY)) {
    openWelcome();
  }
}

init();
