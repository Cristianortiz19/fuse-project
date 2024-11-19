import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAIS-GtbbzJdSzhQ2HHoq7jAoFwzcmnPSg",
    authDomain: "fuse-project-cris.firebaseapp.com",
    projectId: "fuse-project-cris",
    storageBucket: "fuse-project-cris.firebasestorage.app",
    messagingSenderId: "18908067408",
    appId: "1:18908067408:web:15943184d92f3a6a0d4355",
    measurementId: "G-GM514GCX7E"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const analytics = getAnalytics(app);

