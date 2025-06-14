import React, { useState } from 'react';
import axios from 'axios';

const BlogCreate = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Assuming authorId is available from auth state or context
            const authorId = "123"; // Replace with actual user id from auth
            await axios.post('/api/v1/blogs', { title, content, authorId });
            setMessage('Blog posted successfully');
            setTitle('');
            setContent('');
        } catch (error) {
            setMessage('Error posting blog');
        }
    };

    return (
        <div className="blog-create">
            <h2>Create a New Blog Post</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label><br />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Content:</label><br />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={10}
                        cols={50}
                    />
                </div>
                <button type="submit">Post Blog</button>
            </form>
        </div>
    );
};

export default BlogCreate;
