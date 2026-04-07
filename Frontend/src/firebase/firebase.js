import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJxn7MRAtFvq1yVpmekra35BuZD1_HUy8",
  authDomain: "todo-app-a4193.firebaseapp.com",
  projectId: "todo-app-a4193",
  storageBucket: "todo-app-a4193.firebasestorage.app",
  messagingSenderId: "266478796609",
  appId: "1:266478796609:web:6a990bdcf759ecf7dbebc0",
  measurementId: "G-FDQSVVDM3V",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
