// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// 
const firebaseConfig = {
  apiKey: "AIzaSyDQ47MrZIRUeyRbx2LctInL7QAxdGVMM_8",
  authDomain: "bm-logo.firebaseapp.com",
  databaseURL: "https://bm-logo-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bm-logo",
  storageBucket: "bm-logo.appspot.com",
  messagingSenderId: "712161703138",
  appId: "1:712161703138:web:d641d5112f7596f5475abb",
  measurementId: "G-SXCR0QT4PT"
};


export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
