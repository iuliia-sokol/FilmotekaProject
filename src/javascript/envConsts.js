import * as dotenv from 'dotenv';
dotenv.config();

export const FIREBASE_CONFIG = process.env.FIREBASE_CONFIG;
export const API_KEY = process.env.API_KEY;

console.log(FIREBASE_CONFIG);
console.log(API_KEY);
console.log(process.env);

console.log(JSON.parse(FIREBASE_CONFIG));

// const h = JSON.stringify({
//   apiKey: 'AIzaSyDirVSk2C0xEc8PdJg7baqOMmHMSdYv4e8',
//   authDomain: 'filmotekaproject-744dd.firebaseapp.com',
//   projectId: 'filmotekaproject-744dd',
//   storageBucket: 'filmotekaproject-744dd.appspot.com',
//   messagingSenderId: '331180036974',
//   appId: '1:331180036974:web:cccd88ef68088de38ae77f',
// });
// console.log(h);
