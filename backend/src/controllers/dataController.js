import pool from '../config/db.js';

// Helper: Get collection by name
const getCollectionId = async (projectId, collectionName) => {
  const result = await pool.query(
    'SELECT id FROM collections WHERE project_id = $1 AND name = $2',
    [projectId, collectionName]
  );
  return result.rows[0]?.id;
};

// Helper: Build WHERE clause from query params with advanced operators
const buildWhereClause = (queryParams) => {
  const conditions = [];
  const values = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(queryParams)) {
    if (key === 'limit' || key === 'page') continue;

    // Handle comparison operators
    if (key.endsWith('_gt')) {
      const field = key.slice(0, -3);
      conditions.push(`(data->>'${field}')::numeric > $${paramCount}`);
      values.push(value);
      paramCount++;
    } else if (key.endsWith('_lt')) {
      const field = key.slice(0, -3);
      conditions.push(`(data->>'${field}')::numeric < $${paramCount}`);
      values.push(value);
      paramCount++;
    } else if (key.endsWith('_gte')) {
      const field = key.slice(0, -4);
      conditions.push(`(data->>'${field}')::numeric >= $${paramCount}`);
      values.push(value);
      paramCount++;
    } else if (key.endsWith('_lte')) {
      const field = key.slice(0, -4);
      conditions.push(`(data->>'${field}')::numeric <= $${paramCount}`);
      values.push(value);
      paramCount++;
    } else if (key.endsWith('_ne')) {
      // Not equal
      const field = key.slice(0, -3);
      conditions.push(`data->>'${field}' <> $${paramCount}`);
      values.push(value);
      paramCount++;
    } else if (key.endsWith('_in')) {
      // In array: field_in=value1,value2,value3
      const field = key.slice(0, -3);
      const inValues = value.split(',');
      const placeholders = inValues.map((_, i) => `$${paramCount + i}`).join(',');
      conditions.push(`data->>'${field}' IN (${placeholders})`);
      inValues.forEach(v => values.push(v));
      paramCount += inValues.length;
    } else if (key.endsWith('_regex')) {
      // Regex match: field_regex=pattern
      const field = key.slice(0, -6);
      conditions.push(`data->>'${field}' ~* $${paramCount}`);
      values.push(value);
      paramCount++;
    } else if (key.endsWith('_exists')) {
      // Check if field exists
      const field = key.slice(0, -7);
      const exists = value === 'true' || value === '1';
      conditions.push(exists ? `data ? '${field}'` : `NOT data ? '${field}'`);
    } else {
      // Exact match
      conditions.push(`data->>'${key}' = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  return { conditions, values, paramCount };
};

// CREATE - Add record to collection
export const createRecord = async (req, res) => {
  const { projectId, collection } = req.params;
  const data = req.body;

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Request body cannot be empty'
    });
  }

  try {
    const collectionId = await getCollectionId(projectId, collection);
    
    if (!collectionId) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    const result = await pool.query(
      'INSERT INTO records (collection_id, data) VALUES ($1, $2) RETURNING id, data, created_at',
      [collectionId, JSON.stringify(data)]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        ...result.rows[0].data,
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create record'
    });
  }
};

// READ ALL - Get all records with optional filtering
export const getRecords = async (req, res) => {
  const { projectId, collection } = req.params;
  const { limit = 50, page = 1, ...queryParams } = req.query;

  try {
    const collectionId = await getCollectionId(projectId, collection);
    
    if (!collectionId) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    const offset = (page - 1) * limit;
    const { conditions, values } = buildWhereClause(queryParams);

    let query = 'SELECT id, data, created_at FROM records WHERE collection_id = $1';
    const queryValues = [collectionId, ...values];

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}`;
    queryValues.push(limit, offset);

    const result = await pool.query(query, queryValues);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM records WHERE collection_id = $1';
    const countValues = [collectionId, ...values];
    if (conditions.length > 0) {
      countQuery += ' AND ' + conditions.join(' AND ');
    }
    const countResult = await pool.query(countQuery, countValues);

    const records = result.rows.map(row => ({
      id: row.id,
      ...row.data,
      created_at: row.created_at
    }));

    res.json({
      success: true,
      data: records,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch records'
    });
  }
};

// READ ONE - Get single record by ID
export const getRecord = async (req, res) => {
  const { projectId, collection, id } = req.params;

  try {
    const collectionId = await getCollectionId(projectId, collection);
    
    if (!collectionId) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    const result = await pool.query(
      'SELECT id, data, created_at FROM records WHERE collection_id = $1 AND id = $2',
      [collectionId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        ...result.rows[0].data,
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch record'
    });
  }
};

// UPDATE - Update record by ID
export const updateRecord = async (req, res) => {
  const { projectId, collection, id } = req.params;
  const data = req.body;

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Request body cannot be empty'
    });
  }

  try {
    const collectionId = await getCollectionId(projectId, collection);
    
    if (!collectionId) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    const result = await pool.query(
      'UPDATE records SET data = $1 WHERE collection_id = $2 AND id = $3 RETURNING id, data, created_at',
      [JSON.stringify(data), collectionId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        ...result.rows[0].data,
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update record'
    });
  }
};

// DELETE - Delete record by ID
export const deleteRecord = async (req, res) => {
  const { projectId, collection, id } = req.params;

  try {
    const collectionId = await getCollectionId(projectId, collection);
    
    if (!collectionId) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    const result = await pool.query(
      'DELETE FROM records WHERE collection_id = $1 AND id = $2 RETURNING id',
      [collectionId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete record'
    });
  }
};

// BATCH CREATE - Create multiple records at once
export const batchCreateRecords = async (req, res) => {
  const { projectId, collection } = req.params;
  const { records } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Request body must contain an array of records'
    });
  }

  if (records.length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Maximum 100 records per batch'
    });
  }

  try {
    const collectionId = await getCollectionId(projectId, collection);
    
    if (!collectionId) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    // Build bulk insert query
    const values = [];
    const placeholders = [];
    
    records.forEach((record, index) => {
      const paramIndex = index * 2 + 1;
      placeholders.push(`($${paramIndex}, $${paramIndex + 1})`);
      values.push(collectionId, JSON.stringify(record));
    });

    const query = `
      INSERT INTO records (collection_id, data) 
      VALUES ${placeholders.join(', ')} 
      RETURNING id, data, created_at
    `;

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: `${result.rows.length} records created successfully`,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Batch create error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create records'
    });
  }
};

// BATCH UPDATE - Update multiple records by IDs
export const batchUpdateRecords = async (req, res) => {
  const { projectId, collection } = req.params;
  const { updates } = req.body; // Array of {id, data}

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Request body must contain an array of updates with id and data'
    });
  }

  try {
    const collectionId = await getCollectionId(projectId, collection);
    
    if (!collectionId) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    const updatedRecords = [];
    
    // Update each record (could be optimized with CASE statement)
    for (const update of updates) {
      if (!update.id || !update.data) continue;

      const result = await pool.query(
        'UPDATE records SET data = $1, updated_at = NOW() WHERE collection_id = $2 AND id = $3 RETURNING id, data, updated_at',
        [JSON.stringify(update.data), collectionId, update.id]
      );

      if (result.rows.length > 0) {
        updatedRecords.push(result.rows[0]);
      }
    }

    res.json({
      success: true,
      message: `${updatedRecords.length} records updated successfully`,
      data: updatedRecords,
      count: updatedRecords.length
    });
  } catch (error) {
    console.error('Batch update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update records'
    });
  }
};

// BATCH DELETE - Delete multiple records by IDs
export const batchDeleteRecords = async (req, res) => {
  const { projectId, collection } = req.params;
  const { ids } = req.body; // Array of record IDs

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Request body must contain an array of record IDs'
    });
  }

  try {
    const collectionId = await getCollectionId(projectId, collection);
    
    if (!collectionId) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    const placeholders = ids.map((_, i) => `$${i + 2}`).join(',');
    const result = await pool.query(
      `DELETE FROM records WHERE collection_id = $1 AND id IN (${placeholders}) RETURNING id`,
      [collectionId, ...ids]
    );

    res.json({
      success: true,
      message: `${result.rows.length} records deleted successfully`,
      count: result.rows.length,
      deletedIds: result.rows.map(r => r.id)
    });
  } catch (error) {
    console.error('Batch delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete records'
    });
  }
};

// AGGREGATION - Get statistics for a collection
export const getCollectionStats = async (req, res) => {
  const { projectId, collection } = req.params;
  const { field } = req.query; // Optional: specific field to analyze

  try {
    const collectionId = await getCollectionId(projectId, collection);
    
    if (!collectionId) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM records WHERE collection_id = $1',
      [collectionId]
    );

    const total = parseInt(countResult.rows[0].total);

    // Get all data for field analysis
    const records = await pool.query(
      'SELECT data FROM records WHERE collection_id = $1',
      [collectionId]
    );

    const stats = {
      collection,
      totalRecords: total,
      fields: {}
    };

    if (total > 0) {
      // Analyze field usage
      const fieldCounts = {};
      const fieldTypes = {};
      const numericFields = {};

      records.rows.forEach(row => {
        const data = row.data;
        Object.keys(data).forEach(key => {
          fieldCounts[key] = (fieldCounts[key] || 0) + 1;
          
          const value = data[key];
          const type = typeof value;
          
          if (!fieldTypes[key]) {
            fieldTypes[key] = new Set();
          }
          fieldTypes[key].add(type);

          // Track numeric values for stats
          if (type === 'number') {
            if (!numericFields[key]) {
              numericFields[key] = [];
            }
            numericFields[key].push(value);
          }
        });
      });

      // Build field statistics
      Object.keys(fieldCounts).forEach(key => {
        stats.fields[key] = {
          present: fieldCounts[key],
          coverage: ((fieldCounts[key] / total) * 100).toFixed(2) + '%',
          types: Array.from(fieldTypes[key])
        };

        // Add numeric statistics
        if (numericFields[key]) {
          const values = numericFields[key];
          const sum = values.reduce((a, b) => a + b, 0);
          const sorted = [...values].sort((a, b) => a - b);
          
          stats.fields[key].numeric = {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: (sum / values.length).toFixed(2),
            median: sorted[Math.floor(sorted.length / 2)]
          };
        }
      });

      // Get first and last created records
      const firstLast = await pool.query(
        `(SELECT created_at FROM records WHERE collection_id = $1 ORDER BY created_at ASC LIMIT 1)
         UNION ALL
         (SELECT created_at FROM records WHERE collection_id = $1 ORDER BY created_at DESC LIMIT 1)`,
        [collectionId]
      );

      if (firstLast.rows.length >= 2) {
        stats.createdAt = {
          first: firstLast.rows[0].created_at,
          last: firstLast.rows[1].created_at
        };
      }
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get collection statistics'
    });
  }
};
