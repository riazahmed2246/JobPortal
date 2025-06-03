import { Blog } from "../models/blog.model.js";
import { User } from "../models/user.model.js"; // Assuming your user model is 'User'
import asyncHandler from "express-async-handler"; // For handling async errors

// @desc    Create a new blog post
// @route   POST /api/v1/blogs
// @access  Private (Authenticated Users)
export const createBlogPost = asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const authorId = req.user._id; // Assuming 'isAuthenticated' middleware adds user to req

    if (!title || !content) {
        res.status(400);
        throw new Error("Please provide title and content for the blog post.");
    }

    const blogPost = await Blog.create({
        title,
        content,
        author: authorId,
    });

    if (blogPost) {
        // Optionally, add this blog post to the user's list of posts if you have such a field in user.model.js
        // await User.findByIdAndUpdate(authorId, { $push: { blogPosts: blogPost._id } });
        res.status(201).json({
            _id: blogPost._id,
            title: blogPost.title,
            content: blogPost.content,
            author: blogPost.author,
            createdAt: blogPost.createdAt,
            message: "Blog post created successfully!"
        });
    } else {
        res.status(400);
        throw new Error("Invalid blog post data.");
    }
});

// @desc    Get all blog posts
// @route   GET /api/v1/blogs
// @access  Public
export const getAllBlogPosts = asyncHandler(async (req, res) => {
    // Add pagination later if needed: e.g., const pageSize = 10; const page = Number(req.query.pageNumber) || 1;
    // const count = await Blog.countDocuments();
    // const blogs = await Blog.find({}).limit(pageSize).skip(pageSize * (page - 1)).populate('author', 'fullName profile.avatar'); // Populate author details
    const blogs = await Blog.find({})
                            .populate("author", "fullName profile.avatar email") // Populate specific author details
                            .sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json(blogs);
});

// @desc    Get a single blog post by ID
// @route   GET /api/v1/blogs/:id
// @access  Public
export const getBlogPostById = asyncHandler(async (req, res) => {
    const blogPost = await Blog.findById(req.params.id).populate(
        "author",
        "fullName profile.avatar email" // Populate specific author details
    );

    if (blogPost) {
        res.status(200).json(blogPost);
    } else {
        res.status(404);
        throw new Error("Blog post not found.");
    }
});

// @desc    Update a blog post
// @route   PUT /api/v1/blogs/:id
// @access  Private (Author of the post or Admin)
export const updateBlogPost = asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const blogPost = await Blog.findById(req.params.id);

    if (!blogPost) {
        res.status(404);
        throw new Error("Blog post not found.");
    }

    // Check if the logged-in user is the author
    if (blogPost.author.toString() !== req.user._id.toString() /* && req.user.role !== 'admin' */) {
        res.status(401);
        throw new Error("User not authorized to update this post.");
    }

    blogPost.title = title || blogPost.title;
    blogPost.content = content || blogPost.content;

    const updatedPost = await blogPost.save();
    res.status(200).json(updatedPost);
});

// @desc    Delete a blog post
// @route   DELETE /api/v1/blogs/:id
// @access  Private (Author of the post or Admin)
export const deleteBlogPost = asyncHandler(async (req, res) => {
    const blogPost = await Blog.findById(req.params.id);

    if (!blogPost) {
        res.status(404);
        throw new Error("Blog post not found.");
    }

    // Check if the logged-in user is the author or an admin
    if (blogPost.author.toString() !== req.user._id.toString() /* && req.user.role !== 'admin' */) {
        res.status(401);
        throw new Error("User not authorized to delete this post.");
    }

    await Blog.deleteOne({ _id: req.params.id });
    // Optionally, remove this blog post from the user's list of posts
    // await User.findByIdAndUpdate(blogPost.author, { $pull: { blogPosts: blogPost._id } });
    res.status(200).json({ message: "Blog post removed successfully." });
});


// @desc    Upvote a blog post
// @route   POST /api/v1/blogs/:id/upvote
// @access  Private (Authenticated Users)
export const upvoteBlogPost = asyncHandler(async (req, res) => {
    const blogId = req.params.id;
    const userId = req.user._id;

    const blog = await Blog.findById(blogId);

    if (!blog) {
        res.status(404);
        throw new Error("Blog post not found.");
    }

    const alreadyUpvoted = blog.upvotes.includes(userId);
    const alreadyDownvoted = blog.downvotes.includes(userId);

    if (alreadyUpvoted) {
        // Remove upvote
        blog.upvotes.pull(userId);
    } else {
        // Add upvote
        blog.upvotes.push(userId);
        // Remove downvote if it exists
        if (alreadyDownvoted) {
            blog.downvotes.pull(userId);
        }
    }
    await blog.save();
    res.status(200).json({
        message: "Vote updated successfully.",
        upvotes: blog.upvotes.length,
        downvotes: blog.downvotes.length,
        userUpvoted: blog.upvotes.includes(userId),
        userDownvoted: blog.downvotes.includes(userId),
    });
});

// @desc    Downvote a blog post
// @route   POST /api/v1/blogs/:id/downvote
// @access  Private (Authenticated Users)
export const downvoteBlogPost = asyncHandler(async (req, res) => {
    const blogId = req.params.id;
    const userId = req.user._id;

    const blog = await Blog.findById(blogId);

    if (!blog) {
        res.status(404);
        throw new Error("Blog post not found.");
    }

    const alreadyDownvoted = blog.downvotes.includes(userId);
    const alreadyUpvoted = blog.upvotes.includes(userId);

    if (alreadyDownvoted) {
        // Remove downvote
        blog.downvotes.pull(userId);
    } else {
        // Add downvote
        blog.downvotes.push(userId);
        // Remove upvote if it exists
        if (alreadyUpvoted) {
            blog.upvotes.pull(userId);
        }
    }
    await blog.save();
    res.status(200).json({
        message: "Vote updated successfully.",
        upvotes: blog.upvotes.length,
        downvotes: blog.downvotes.length,
        userUpvoted: blog.upvotes.includes(userId),
        userDownvoted: blog.downvotes.includes(userId),
    });
});