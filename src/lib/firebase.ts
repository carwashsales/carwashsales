// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: 'siyara-wasla',
  appId: '1:387887451588:web:4265324fd359dee4efe891',
  storageBucket: 'siyara-wasla.firebasestorage.app',
  apiKey: 'AIzaSyCQ9mclZNurqP1Y5JyzYX-Rkc3lvoa4bhY',
  authDomain: 'siyara-wasla.firebaseapp.com',
  messagingSenderId: '387887451588',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
