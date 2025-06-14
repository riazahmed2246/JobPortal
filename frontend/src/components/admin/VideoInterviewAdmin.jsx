import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VideoInterviewAdmin = () => {
    const [sessions, setSessions] = useState([]);
    const [newSession, setNewSession] = useState({
        id: '',
        title: '',
        scheduledTime: '',
        participants: ''
    });

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await axios.get('/api/video-interviews');
            setSessions(res.data);
        } catch (error) {
            console.error('Failed to fetch sessions', error);
        }
    };

    const handleInputChange = (e) => {
        setNewSession({ ...newSession, [e.target.name]: e.target.value });
    };

    const handleCreateSession = async () => {
        try {
            const participantsArray = newSession.participants.split(',').map(p => p.trim());
            const payload = { ...newSession, participants: participantsArray };
            await axios.post('/api/video-interviews', payload);
            setNewSession({ id: '', title: '', scheduledTime: '', participants: '' });
            fetchSessions();
        } catch (error) {
            console.error('Failed to create session', error);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Video Conference Interview Admin</h1>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Create New Session</h2>
                <input
                    type="text"
                    name="id"
                    placeholder="Session ID"
                    value={newSession.id}
                    onChange={handleInputChange}
                    className="border p-2 mr-2"
                />
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={newSession.title}
                    onChange={handleInputChange}
                    className="border p-2 mr-2"
                />
                <input
                    type="datetime-local"
                    name="scheduledTime"
                    placeholder="Scheduled Time"
                    value={newSession.scheduledTime}
                    onChange={handleInputChange}
                    className="border p-2 mr-2"
                />
                <input
                    type="text"
                    name="participants"
                    placeholder="Participants (comma separated)"
                    value={newSession.participants}
                    onChange={handleInputChange}
                    className="border p-2 mr-2"
                />
                <button
                    onClick={handleCreateSession}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Create
                </button>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">Scheduled Sessions</h2>
                <ul>
                    {sessions.map(session => (
                        <li key={session.id} className="mb-2 border p-2 rounded">
                            <div><strong>ID:</strong> {session.id}</div>
                            <div><strong>Title:</strong> {session.title}</div>
                            <div><strong>Scheduled Time:</strong> {new Date(session.scheduledTime).toLocaleString()}</div>
                            <div><strong>Participants:</strong> {session.participants.join(', ')}</div>
                            <div><strong>Status:</strong> {session.status}</div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default VideoInterviewAdmin;
