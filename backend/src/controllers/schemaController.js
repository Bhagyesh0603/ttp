import pool from '../config/db.js';

// Infer schema from existing data in collection
export const getCollectionSchema = async (req, res) => {
  const { projectId, collectionName } = req.params;

  try {
    // Get collection ID
    const collectionResult = await pool.query(
      'SELECT id FROM collections WHERE project_id = $1 AND name = $2',
      [projectId, collectionName]
    );

    if (collectionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    const collectionId = collectionResult.rows[0].id;

    // Get sample records to infer schema
    const records = await pool.query(
      'SELECT data FROM records WHERE collection_id = $1 LIMIT 100',
      [collectionId]
    );

    if (records.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          schema: {},
          sampleData: null,
          recordCount: 0,
          message: 'No records found in collection'
        }
      });
    }

    // Analyze data structure
    const schema = {};
    const fieldTypes = {};
    const fieldExamples = {};

    records.rows.forEach(row => {
      const data = row.data;
      Object.keys(data).forEach(key => {
        if (!schema[key]) {
          schema[key] = new Set();
          fieldExamples[key] = [];
        }
        
        const value = data[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        schema[key].add(type);
        
        // Store example values (max 3)
        if (fieldExamples[key].length < 3 && value !== null && value !== undefined) {
          fieldExamples[key].push(value);
        }
      });
    });

    // Convert schema to object
    const schemaObject = {};
    Object.keys(schema).forEach(key => {
      const types = Array.from(schema[key]);
      schemaObject[key] = {
        types: types,
        required: records.rows.filter(r => r.data[key] !== undefined).length > records.rows.length * 0.8,
        examples: fieldExamples[key]
      };
    });

    // Get most recent record as sample
    const sampleRecord = records.rows[0].data;

    res.json({
      success: true,
      data: {
        collection: collectionName,
        recordCount: records.rows.length,
        schema: schemaObject,
        sampleData: sampleRecord,
        fields: Object.keys(schemaObject)
      }
    });
  } catch (error) {
    console.error('Schema inference error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to infer schema'
    });
  }
};

// Generate dynamic code snippets based on actual data structure
export const generateCodeSnippets = async (req, res) => {
  const { projectId, collectionName } = req.params;
  const { language = 'javascript' } = req.query;

  try {
    // Get schema first
    const collectionResult = await pool.query(
      'SELECT id FROM collections WHERE project_id = $1 AND name = $2',
      [projectId, collectionName]
    );

    if (collectionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    const collectionId = collectionResult.rows[0].id;

    // Get sample record
    const records = await pool.query(
      'SELECT data FROM records WHERE collection_id = $1 LIMIT 1',
      [collectionId]
    );

    const sampleData = records.rows.length > 0 ? records.rows[0].data : { name: 'John Doe', email: 'john@example.com' };
    
    // Get API key from project
    const project = await pool.query(
      'SELECT api_key FROM projects WHERE id = $1',
      [projectId]
    );
    
    const apiKey = project.rows[0]?.api_key || 'YOUR_API_KEY';
    const apiUrl = process.env.API_URL || 'http://localhost:5000';

    // Generate snippets based on language
    const snippets = generateSnippetsForLanguage(language, apiUrl, projectId, collectionName, apiKey, sampleData);

    res.json({
      success: true,
      data: {
        language,
        collection: collectionName,
        sampleData,
        snippets
      }
    });
  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate code snippets'
    });
  }
};

function generateSnippetsForLanguage(language, apiUrl, projectId, collection, apiKey, sampleData) {
  const sampleJson = JSON.stringify(sampleData, null, 2);
  const sampleJsonCompact = JSON.stringify(sampleData);

  if (language === 'javascript' || language === 'fetch') {
    return {
      create: `// Create Record
fetch('${apiUrl}/api/${projectId}/${collection}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey}'
  },
  body: JSON.stringify(${sampleJson})
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`,

      getAll: `// Get All Records
fetch('${apiUrl}/api/${projectId}/${collection}', {
  headers: { 'x-api-key': '${apiKey}' }
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`,

      getOne: `// Get Single Record
fetch('${apiUrl}/api/${projectId}/${collection}/RECORD_ID', {
  headers: { 'x-api-key': '${apiKey}' }
})
  .then(res => res.json())
  .then(data => console.log(data));`,

      update: `// Update Record
fetch('${apiUrl}/api/${projectId}/${collection}/RECORD_ID', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey}'
  },
  body: JSON.stringify(${sampleJson})
})
  .then(res => res.json())
  .then(data => console.log(data));`,

      delete: `// Delete Record
fetch('${apiUrl}/api/${projectId}/${collection}/RECORD_ID', {
  method: 'DELETE',
  headers: { 'x-api-key': '${apiKey}' }
})
  .then(res => res.json())
  .then(data => console.log(data));`,

      batchCreate: `// Batch Create Multiple Records
fetch('${apiUrl}/api/${projectId}/${collection}/batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey}'
  },
  body: JSON.stringify({
    records: [${sampleJsonCompact}, ${sampleJsonCompact}]
  })
})
  .then(res => res.json())
  .then(data => console.log(data));`
    };
  } else if (language === 'axios') {
    return {
      create: `// Create Record (Axios)
const axios = require('axios');

axios.post('${apiUrl}/api/${projectId}/${collection}', ${sampleJson}, {
  headers: { 'x-api-key': '${apiKey}' }
})
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`,

      getAll: `// Get All Records (Axios)
axios.get('${apiUrl}/api/${projectId}/${collection}', {
  headers: { 'x-api-key': '${apiKey}' }
})
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`
    };
  } else if (language === 'python') {
    return {
      create: `# Create Record (Python)
import requests

url = '${apiUrl}/api/${projectId}/${collection}'
headers = {'x-api-key': '${apiKey}', 'Content-Type': 'application/json'}
data = ${JSON.stringify(sampleData, null, 2).replace(/"/g, "'")}

response = requests.post(url, json=data, headers=headers)
print(response.json())`,

      getAll: `# Get All Records (Python)
import requests

url = '${apiUrl}/api/${projectId}/${collection}'
headers = {'x-api-key': '${apiKey}'}

response = requests.get(url, headers=headers)
print(response.json())`
    };
  } else if (language === 'curl') {
    return {
      create: `# Create Record (cURL)
curl -X POST '${apiUrl}/api/${projectId}/${collection}' \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: ${apiKey}' \\
  -d '${sampleJsonCompact}'`,

      getAll: `# Get All Records (cURL)
curl -X GET '${apiUrl}/api/${projectId}/${collection}' \\
  -H 'x-api-key: ${apiKey}'`
    };
  }

  return {};
}
