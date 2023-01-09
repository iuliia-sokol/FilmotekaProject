import * as dotenv from 'dotenv';
dotenv.config();

// ThemovieDB
export const API_KEY = process.env.API_KEY;

//  Firebase configuration

export const FIREBASE_CONFIG = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
};

// console.log(FIREBASE_CONFIG);
// console.log(API_KEY);
