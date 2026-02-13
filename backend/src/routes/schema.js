import express from 'express';
import {
  getCollectionSchema,
  generateCodeSnippets
} from '../controllers/schemaController.js';
import { authenticateApiKey } from '../middleware/auth.js';

const router = express.Router();

// Schema routes require API key
router.use(authenticateApiKey);

// Get inferred schema from collection data
router.get('/:projectId/:collectionName/schema', getCollectionSchema);

// Generate code snippets for collection
router.get('/:projectId/:collectionName/snippets', generateCodeSnippets);

export default router;
