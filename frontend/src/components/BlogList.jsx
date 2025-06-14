import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get('/api/v1/blogs');
                setBlogs(response.data);
            } catch (err) {
                setError('Error fetching blogs');
            }
        };
        fetchBlogs();
    }, []);

    return (
        <div className="blog-list">
            <h2>All Blogs</h2>
            {error && <p>{error}</p>}
            <ul>
                {blogs.map(blog => (
                    <li key={blog._id}>
                        <Link to={`/blogs/${blog._id}`}>{blog.title}</Link> by {blog.authorId}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BlogList;
