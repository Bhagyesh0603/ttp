import express from 'express';
import {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
  batchCreateRecords,
  batchUpdateRecords,
  batchDeleteRecords,
  getCollectionStats
} from '../controllers/dataController.js';
import { authenticateApiKey } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// All data routes require API key and rate limiting
router.use(authenticateApiKey);
router.use(apiLimiter);

// Batch operations (must be before single record routes)
router.post('/:projectId/:collection/batch', batchCreateRecords);
router.put('/:projectId/:collection/batch', batchUpdateRecords);
router.delete('/:projectId/:collection/batch', batchDeleteRecords);

// Collection statistics
router.get('/:projectId/:collection/stats', getCollectionStats);

// Dynamic CRUD routes
router.post('/:projectId/:collection', createRecord);
router.get('/:projectId/:collection', getRecords);
router.get('/:projectId/:collection/:id', getRecord);
router.put('/:projectId/:collection/:id', updateRecord);
router.delete('/:projectId/:collection/:id', deleteRecord);

export default router;
