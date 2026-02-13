import pool from '../config/db.js';
import crypto from 'crypto';

// Generate unique API key
const generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Create new project
export const createProject = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId; // From JWT token

  if (!name || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Project name is required'
    });
  }

  try {
    const apiKey = generateApiKey();
    
    const result = await pool.query(
      'INSERT INTO projects (name, api_key, user_id) VALUES ($1, $2, $3) RETURNING id, name, api_key, created_at',
      [name.trim(), apiKey, userId]
    );

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        api_key: result.rows[0].api_key,
        created_at: result.rows[0].created_at,
        base_url: `${req.protocol}://${req.get('host')}/api/${result.rows[0].id}`
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    });
  }
};

// Get all projects (for dashboard) - Only user's projects
export const getAllProjects = async (req, res) => {
  const userId = req.user.userId; // From JWT token

  try {
    const result = await pool.query(
      'SELECT id, name, api_key, created_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    });
  }
};

// Get single project - Only if user owns it
export const getProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId; // From JWT token

  try {
    const result = await pool.query(
      'SELECT id, name, api_key, created_at FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project'
    });
  }
};

// Delete project - Only if user owns it
export const deleteProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId; // From JWT token

  try {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    });
  }
};
