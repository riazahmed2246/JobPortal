import express from 'express';
import { createSession, listSessions, getSession, updateSession, deleteSession } from '../controllers/videoInterviewController.js';

const router = express.Router();

router.post('/', createSession);
router.get('/', listSessions);
router.get('/:id', getSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

export default router;
