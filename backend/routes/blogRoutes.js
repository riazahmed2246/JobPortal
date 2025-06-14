import express from 'express';
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    upvoteBlog,
    downvoteBlog
} from '../controllers/blogController.js';

const router = express.Router();

router.post('/', createBlog);
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);
router.post('/:id/upvote', upvoteBlog);
router.post('/:id/downvote', downvoteBlog);

export default router;
