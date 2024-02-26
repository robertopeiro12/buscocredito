import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQgSUaavEZJ1wbpQuPBpuPWjynViK1k0g",
  authDomain: "buscocredito-b3f6d.firebaseapp.com",
  projectId: "buscocredito-b3f6d",
  storageBucket: "buscocredito-b3f6d.appspot.com",
  messagingSenderId: "242507626777",
  appId: "1:242507626777:web:e6145b1f4884a68f8e2d88",
  measurementId: "G-HJR923HRPS"
};
const app = initializeApp(firebaseConfig);
// Initialize Firebase
export const auth = getAuth(app);
export default app;