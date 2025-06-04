const Vlog = require('../models/Vlog');

exports.uploadVlog = async (req, res) => {
    try {
        const { title, description, tags } = req.body;
        const newVlog = new Vlog({
            title,
            description,
            tags: tags?.split(',').map(tag => tag.trim()),
            videoUrl: `/uploads/${req.file.filename}`
        });
        await newVlog.save();
        res.status(201).json({ message: 'Vlog uploaded successfully', vlog: newVlog });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
