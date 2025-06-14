const videoInterviews = [];

export const createSession = (req, res) => {
    const { id, title, scheduledTime, participants } = req.body;
    const newSession = { id, title, scheduledTime, participants, status: 'scheduled' };
    videoInterviews.push(newSession);
    res.status(201).json({ message: 'Video interview session created', session: newSession });
};

export const listSessions = (req, res) => {
    res.json(videoInterviews);
};

export const getSession = (req, res) => {
    const session = videoInterviews.find(s => s.id === req.params.id);
    if (!session) {
        return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
};

export const updateSession = (req, res) => {
    const session = videoInterviews.find(s => s.id === req.params.id);
    if (!session) {
        return res.status(404).json({ message: 'Session not found' });
    }
    Object.assign(session, req.body);
    res.json({ message: 'Session updated', session });
};

export const deleteSession = (req, res) => {
    const index = videoInterviews.findIndex(s => s.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Session not found' });
    }
    videoInterviews.splice(index, 1);
    res.json({ message: 'Session deleted' });
};
