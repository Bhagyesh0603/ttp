import pool from '../config/db.js';

export const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key is required. Add x-api-key header.'
    });
  }

  try {
    const result = await pool.query(
      'SELECT id, name FROM projects WHERE api_key = $1',
      [apiKey]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key'
      });
    }

    req.project = result.rows[0];
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};
