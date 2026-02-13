import express from 'express';
import {
  createProject,
  getAllProjects,
  getProject,
  deleteProject
} from '../controllers/projectController.js';
import { createProjectLimiter } from '../middleware/rateLimit.js';
import { authenticateUser } from '../middleware/authUser.js';

const router = express.Router();

// All project routes require authentication
router.use(authenticateUser);

router.post('/', createProjectLimiter, createProject);
router.get('/', getAllProjects);
router.get('/:id', getProject);
router.delete('/:id', deleteProject);

export default router;
