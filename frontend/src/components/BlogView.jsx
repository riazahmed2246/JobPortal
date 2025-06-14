import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const BlogView = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`/api/v1/blogs/${id}`);
                setBlog(response.data);
            } catch (err) {
                setError('Error fetching blog');
            }
        };
        fetchBlog();
    }, [id]);

    const handleUpvote = async () => {
        try {
            const response = await axios.post(`/api/v1/blogs/${id}/upvote`);
            setBlog(response.data);
            setMessage('Upvoted!');
        } catch (err) {
            setMessage('Error upvoting');
        }
    };

    const handleDownvote = async () => {
        try {
            const response = await axios.post(`/api/v1/blogs/${id}/downvote`);
            setBlog(response.data);
            setMessage('Downvoted!');
        } catch (err) {
            setMessage('Error downvoting');
        }
    };

    if (error) return <p>{error}</p>;
    if (!blog) return <p>Loading...</p>;

    return (
        <div className="blog-view">
            <h2>{blog.title}</h2>
            <p>By {blog.authorId}</p>
            <p>{blog.content}</p>
            <p>Upvotes: {blog.upvotes} | Downvotes: {blog.downvotes}</p>
            {message && <p>{message}</p>}
            <button onClick={handleUpvote}>Upvote</button>
            <button onClick={handleDownvote}>Downvote</button>
        </div>
    );
};

export default BlogView;
