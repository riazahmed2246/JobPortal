import Blog from '../models/blog.js';

// Create a new blog post
export const createBlog = async (req, res) => {
    try {
        const { title, content, authorId } = req.body;
        const blog = new Blog({ title, content, authorId });
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Error creating blog', error });
    }
};

// Get all blog posts
export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blogs', error });
    }
};

// Get a single blog post by id
export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blog', error });
    }
};

// Update a blog post by id
export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Error updating blog', error });
    }
};

// Delete a blog post by id
export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.json({ message: 'Blog deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting blog', error });
    }
};

// Upvote a blog post
export const upvoteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        blog.upvotes += 1;
        await blog.save();
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Error upvoting blog', error });
    }
};

// Downvote a blog post
export const downvoteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        blog.downvotes += 1;
        await blog.save();
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Error downvoting blog', error });
    }
};
