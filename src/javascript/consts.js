import * as dotenv from 'dotenv';
dotenv.config();

// ThemovieDB
export const API_KEY = process.env.API_KEY;

//  Firebase configuration
export const FIREBASE_CONFIG = process.env.FIREBASE_CONFIG;

console.log(FIREBASE_CONFIG);
console.log(API_KEY);
