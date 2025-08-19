// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFNlCXbvUZqQYz9WLsxsqC_Gjw4cq4kx8",
  authDomain: "localloop-286f2.firebaseapp.com",
  projectId: "localloop-286f2",
  storageBucket: "localloop-286f2.firebasestorage.app",
  messagingSenderId: "953558348648",
  appId: "1:953558348648:web:8e448cad4dd31ec63a1cdd",
  measurementId: "G-FVES1M3916"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);