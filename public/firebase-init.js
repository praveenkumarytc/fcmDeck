import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCeeIwq2_w5VmYvZxDHurIG5A8r241c6mg",
  authDomain: "fir-push-notifications-b9767.firebaseapp.com",
  projectId: "fir-push-notifications-b9767",
  storageBucket: "fir-push-notifications-b9767.firebasestorage.app",
  messagingSenderId: "595262611218",
  appId: "1:595262611218:web:db554cb65f8f4a201eddcb",
  measurementId: "G-SKRCGXLNE5",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

window.firebaseWebApp = { app, analytics };
