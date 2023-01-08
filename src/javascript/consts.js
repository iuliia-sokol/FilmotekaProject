import * as dotenv from 'dotenv';
dotenv.config();
// import express from 'express';

// ThemovieDB
export const API_KEY = process.env.API_KEY;
// export const API_KEY = '663bd5fd8d905b7ce2d57e9867d3492e';

//  Firebase configuration
// export const FIREBASE_CONFIG = JSON.parse(process.env.FIREBASE_CONFIG);

export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBglmuNVewy1l7IUbE5KW2_O5fvpVxdZxg',
  authDomain: 'filmoteka-e29b5.firebaseapp.com',
  databaseURL:
    'https://filmoteka-e29b5-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'filmoteka-e29b5',
  storageBucket: 'filmoteka-e29b5.appspot.com',
  messagingSenderId: '444486444061',
  appId: '1:444486444061:web:04353f02de3f72763252f4',
};
