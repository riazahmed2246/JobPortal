const express = require('express');
const multer = require('multer');
const { uploadVlog } = require('../controllers/vlogController');
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

router.post('/', upload.single('video'), uploadVlog);

module.exports = router;
