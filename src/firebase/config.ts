import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyD20VIPytnhyjZCMzQqlkF6iBkqWvJm6iU',
  authDomain: 'quickchat-fac82.firebaseapp.com',
  projectId: 'quickchat-fac82',
  storageBucket: 'quickchat-fac82.firebasestorage.app',
  messagingSenderId: '959738951571',
  appId: '1:959738951571:web:366634cf99384460801a66',
  measurementId: 'G-NCGV7E10MC',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
