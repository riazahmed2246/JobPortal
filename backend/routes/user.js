import express from "express";
import { login, logout, register, updateProfile } from "../controllers/user.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/mutler.js";

// import { createAndUploadResume, startMockInterview, processInterviewResponse } from '../controllers/user.controller.js';
 
const router = express.Router();

router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated,singleUpload,updateProfile);



// router.post('/create-resume', isAuthenticated, createAndUploadResume);
// router.get('/mock-interview/start', isAuthenticated, startMockInterview);
// router.post('/mock-interview/respond', isAuthenticated, processInterviewResponse);

export default router;

