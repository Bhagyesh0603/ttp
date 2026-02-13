import express from 'express';
import {
  createCollection,
  getCollections,
  deleteCollection
} from '../controllers/collectionController.js';
import { authenticateApiKey } from '../middleware/auth.js';

const router = express.Router();

// All collection routes require API key
router.use(authenticateApiKey);

router.post('/', createCollection);
router.get('/', getCollections);
router.delete('/:name', deleteCollection);

export default router;
