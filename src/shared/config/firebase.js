import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// TODO: Замените на ваши Firebase credentials
const firebaseConfig = {
  apiKey: "AIzaSyB5I9jFkXkXqLEgsa4E1WFRAykxKZHlffM",
  authDomain: "curs-8f6bc.firebaseapp.com",
  projectId: "curs-8f6bc",
  storageBucket: "curs-8f6bc.firebasestorage.app",
  messagingSenderId: "989625461124",
  appId: "1:989625461124:web:5e019f1cfc9cab8d8ed5d1",
  measurementId: "G-YVM5CFP1R5"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

