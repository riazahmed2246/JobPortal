const express = require('express');
const router = express.Router();
const controller = require('../controllers/interviewToolkitController');

router.get('/', controller.getToolkit);
router.get('/questions/:role', controller.getQuestions);
router.get('/tips/:company', controller.getTips);

module.exports = router;
