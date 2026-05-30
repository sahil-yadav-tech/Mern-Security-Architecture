import express from 'express';
import {  loginUser, sendOTP, verifyOTP } from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);

export default router;
