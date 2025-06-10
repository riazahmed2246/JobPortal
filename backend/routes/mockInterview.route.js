import express from "express";
import { startMockInterview } from "../controllers/mockInterview.controller.js";

const router = express.Router();

router.post("/", startMockInterview);

export default router;
