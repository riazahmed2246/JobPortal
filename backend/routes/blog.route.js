import express from "express";
import {
    createBlogPost,
    getAllBlogPosts,
    getBlogPostById,
    updateBlogPost,
    deleteBlogPost,
    upvoteBlogPost,
    downvoteBlogPost,
} from "../controllers/blog.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js"; // Your existing auth middleware

const router = express.Router();

// Public routes
router.get("/", getAllBlogPosts);
router.get("/:id", getBlogPostById);

// Private routes (require authentication)
router.post("/", isAuthenticated, createBlogPost);
router.put("/:id", isAuthenticated, updateBlogPost);
router.delete("/:id", isAuthenticated, deleteBlogPost);
router.post("/:id/upvote", isAuthenticated, upvoteBlogPost);
router.post("/:id/downvote", isAuthenticated, downvoteBlogPost);

export default router;