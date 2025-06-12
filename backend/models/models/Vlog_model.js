const mongoose = require('mongoose');

const VlogSchema = new mongoose.Schema({
    title: String,
    description: String,
    tags: [String],
    videoUrl: String,
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vlog', VlogSchema);
