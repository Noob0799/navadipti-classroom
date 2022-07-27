import firebase from "firebase/compat/app";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "navadipti-classroom.firebaseapp.com",
  projectId: "navadipti-classroom",
  storageBucket: "navadipti-classroom.appspot.com",
  messagingSenderId: "1023338898129",
  appId: "1:1023338898129:web:5533a70d4c293517001bf0",
  measurementId: "G-PVKMEZMRTX"
};

firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

export {storage, firebase as default};