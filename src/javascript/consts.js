import * as dotenv from 'dotenv';
dotenv.config();
// import express from 'express';

// ThemovieDB
export const API_KEY = process.env.API_KEY;

//  Firebase configuration
export const FIREBASE_CONFIG = JSON.parse(process.env.FIREBASE_CONFIG);
