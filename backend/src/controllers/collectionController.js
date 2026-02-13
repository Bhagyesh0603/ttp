import pool from '../config/db.js';

// Create collection
export const createCollection = async (req, res) => {
  const { name } = req.body;
  const projectId = req.project.id;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Collection name is required'
    });
  }

  // Validate collection name (alphanumeric and underscores only)
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return res.status(400).json({
      success: false,
      error: 'Collection name must be alphanumeric (a-z, 0-9, _)'
    });
  }

  try {
    const result = await pool.query(
      'INSERT INTO collections (project_id, name) VALUES ($1, $2) RETURNING id, name, created_at',
      [projectId, name.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Collection created successfully',
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        created_at: result.rows[0].created_at,
        endpoint: `/api/${projectId}/${name}`
      }
    });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        error: 'Collection already exists'
      });
    }
    console.error('Create collection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create collection'
    });
  }
};

// Get all collections for a project
export const getCollections = async (req, res) => {
  const projectId = req.project.id;

  try {
    const result = await pool.query(
      'SELECT id, name, created_at FROM collections WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collections'
    });
  }
};

// Delete collection
export const deleteCollection = async (req, res) => {
  const { name } = req.params;
  const projectId = req.project.id;

  try {
    const result = await pool.query(
      'DELETE FROM collections WHERE project_id = $1 AND name = $2 RETURNING id',
      [projectId, name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    res.json({
      success: true,
      message: 'Collection deleted successfully'
    });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete collection'
    });
  }
};
