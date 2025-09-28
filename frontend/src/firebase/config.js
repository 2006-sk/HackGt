import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJU0WW_ojXklgQOhsmXvp7gfUkKS0Cc2Q",
  authDomain: "hackgt-as.firebaseapp.com",
  projectId: "hackgt-as",
  storageBucket: "hackgt-as.firebasestorage.app",
  messagingSenderId: "143585161167",
  appId: "1:143585161167:web:2c661fdd92295b7df6ecba",
  measurementId: "G-7LHYR9JT4T",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
