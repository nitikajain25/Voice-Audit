import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";







// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiu-KflWJ9sLQHpfQ0x6VsDUoQ8PxYE0Y",
  authDomain: "voice-audit-ef68e.firebaseapp.com",
  projectId: "voice-audit-ef68e",
  storageBucket: "voice-audit-ef68e.firebasestorage.app",
  messagingSenderId: "918826806786",
  appId: "1:918826806786:web:8545a95211aef62c72411b",
  measurementId: "G-65N1LX3ZTY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Auth
export const auth = getAuth(app);

export { app, analytics };
export default app;



