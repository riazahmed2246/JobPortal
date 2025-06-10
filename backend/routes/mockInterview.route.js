import express from "express";
import { startMockInterview } from "../controllers/mockInterview.controller.js";

const router = express.Router();

router.post("/", startMockInterview);
router.post("/submit", submitMockInterview);

export default router;
