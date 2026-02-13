import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const CodeBlock = ({ code, language = 'javascript' }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs transition"
      >
        {copied ? '✓ Copied!' : 'Copy'}
      </button>
    </div>
  );
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [collections, setCollections] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newRecordData, setNewRecordData] = useState('');
  const [error, setError] = useState('');
  const [showCodeExamples, setShowCodeExamples] = useState(false);
  const [selectedCodeTab, setSelectedCodeTab] = useState('create');
  const [collectionSchema, setCollectionSchema] = useState(null);
  const [collectionStats, setCollectionStats] = useState(null);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (project) {
      fetchCollections();
    }
  }, [project]);

  useEffect(() => {
    if (selectedCollection && project) {
      fetchRecords();
      fetchCollectionSchema();
      fetchCollectionStats();
    }
  }, [selectedCollection]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProject(data.data);
      }
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch('/collections', {
        headers: { 'x-api-key': project.api_key }
      });
      const data = await response.json();
      if (data.success) {
        setCollections(data.data);
      }
    } catch (err) {
      console.error('Failed to load collections', err);
    }
  };

  const createCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      const response = await fetch('/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': project.api_key
        },
        body: JSON.stringify({ name: newCollectionName })
      });

      const data = await response.json();
      if (data.success) {
        setCollections([...collections, data.data]);
        setNewCollectionName('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to create collection');
    }
  };

  const fetchRecords = async () => {
    try {
      const response = await fetch(`/api/${id}/${selectedCollection}`, {
        headers: { 'x-api-key': project.api_key }
      });
      const data = await response.json();
      if (data.success) {
        setRecords(data.data);
      }
    } catch (err) {
      console.error('Failed to load records', err);
    }
  };

  const fetchCollectionSchema = async () => {
    try {
      const response = await fetch(`/schema/${id}/${selectedCollection}/schema`, {
        headers: { 'x-api-key': project.api_key }
      });
      const data = await response.json();
      if (data.success) {
        setCollectionSchema(data.data);
      }
    } catch (err) {
      console.error('Failed to load schema', err);
    }
  };

  const fetchCollectionStats = async () => {
    try {
      const response = await fetch(`/api/${id}/${selectedCollection}/stats`, {
        headers: { 'x-api-key': project.api_key }
      });
      const data = await response.json();
      if (data.success) {
        setCollectionStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const createRecord = async (e) => {
    e.preventDefault();
    if (!newRecordData.trim() || !selectedCollection) return;

    try {
      const jsonData = JSON.parse(newRecordData);
      const response = await fetch(`/api/${id}/${selectedCollection}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': project.api_key
        },
        body: JSON.stringify(jsonData)
      });

      const data = await response.json();
      if (data.success) {
        setRecords([data.data, ...records]);
        setNewRecordData('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
      </div>

      {/* API Key Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Your API Configuration</h2>
            <p className="text-blue-100 text-sm">Use these credentials to access your data</p>
          </div>
          <button
            onClick={() => setShowCodeExamples(!showCodeExamples)}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
          >
            {showCodeExamples ? 'Hide' : 'Show'} Code Examples
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-blue-100 text-sm font-medium">API Endpoint</label>
            <div className="bg-blue-800 bg-opacity-50 px-4 py-2 rounded mt-1 font-mono text-sm">
              http://localhost:5000/api/{id}/[collection]
            </div>
          </div>
          <div>
            <label className="text-blue-100 text-sm font-medium">API Key</label>
            <div className="bg-blue-800 bg-opacity-50 px-4 py-2 rounded mt-1 font-mono text-sm break-all">
              {project.api_key}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features Section */}
      {selectedCollection && collectionSchema && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">🚀 Advanced Features</h2>
              <p className="text-purple-100 text-sm">Explore powerful capabilities for "{selectedCollection}"</p>
            </div>
            <button
              onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 transition"
            >
              {showAdvancedFeatures ? 'Hide' : 'Show'} Advanced
            </button>
          </div>

          {showAdvancedFeatures && (
            <div className="space-y-6 mt-6">
              {/* Schema Info */}
              <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">📊 Inferred Schema</h3>
                <p className="text-purple-100 text-sm mb-3">
                  Based on {collectionSchema.recordCount} records
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(collectionSchema.schema || {}).map(field => (
                    <div key={field} className="bg-purple-900 bg-opacity-50 p-3 rounded">
                      <div className="font-mono text-sm text-purple-200">{field}</div>
                      <div className="text-xs text-purple-300 mt-1">
                        {collectionSchema.schema[field].types.join(' | ')}
                      </div>
                      {collectionSchema.schema[field].required && (
                        <span className="text-xs bg-purple-600 px-2 py-1 rounded mt-1 inline-block">required</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Collection Stats */}
              {collectionStats && (
                <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">📈 Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{collectionStats.totalRecords}</div>
                      <div className="text-purple-200 text-sm">Total Records</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{Object.keys(collectionStats.fields || {}).length}</div>
                      <div className="text-purple-200 text-sm">Fields</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {Object.values(collectionStats.fields || {}).filter(f => f.numeric).length}
                      </div>
                      <div className="text-purple-200 text-sm">Numeric Fields</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Query Operators */}
              <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">🔍 Advanced Query Operators</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-3">
                    <code className="bg-purple-900 px-2 py-1 rounded text-purple-200">field_in</code>
                    <span className="text-purple-100">Match any value in list: <code>?role_in=admin,moderator</code></span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <code className="bg-purple-900 px-2 py-1 rounded text-purple-200">field_ne</code>
                    <span className="text-purple-100">Not equal: <code>?status_ne=deleted</code></span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <code className="bg-purple-900 px-2 py-1 rounded text-purple-200">field_regex</code>
                    <span className="text-purple-100">Pattern match: <code>?name_regex=^John</code></span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <code className="bg-purple-900 px-2 py-1 rounded text-purple-200">field_exists</code>
                    <span className="text-purple-100">Check field exists: <code>?email_exists=true</code></span>
                  </div>
                </div>
              </div>

              {/* Batch Operations */}
              <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">⚡ Batch Operations</h3>
                <CodeBlock code={`// Batch Create (up to 100 records)
fetch('http://localhost:5000/api/${id}/${selectedCollection}/batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${project.api_key}'
  },
  body: JSON.stringify({
    records: [
      ${collectionSchema.sampleData ? JSON.stringify(collectionSchema.sampleData, null, 6) : '{ name: "Item 1" }'},
      ${collectionSchema.sampleData ? JSON.stringify(collectionSchema.sampleData, null, 6) : '{ name: "Item 2" }'}
    ]
  })
})
  .then(res => res.json())
  .then(data => console.log(data.count + ' records created'));`} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Code Examples Section */}
      {showCodeExamples && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📘 API Code Examples</h2>
          <p className="text-gray-600 mb-6">
            Copy and paste these examples into your frontend code. Replace [collection] with your actual collection name (e.g., "users").
          </p>

          {/* Tabs */}
          <div className="flex space-x-2 mb-4 border-b border-gray-200">
            {[
              { id: 'create', label: 'Create Record', emoji: '➕' },
              { id: 'getAll', label: 'Get All Records', emoji: '📋' },
              { id: 'getOne', label: 'Get Single Record', emoji: '🔍' },
              { id: 'update', label: 'Update Record', emoji: '✏️' },
              { id: 'delete', label: 'Delete Record', emoji: '🗑️' },
              { id: 'filter', label: 'Filter Records', emoji: '🔎' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCodeTab(tab.id)}
                className={`px-4 py-2 font-medium text-sm transition ${
                  selectedCodeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>

          {/* Code Examples */}
          <div className="space-y-4">
            {selectedCodeTab === 'create' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900">Create a New Record (POST)</h3>
                <CodeBlock code={`// Create a new record
fetch('http://localhost:5000/api/${id}/${selectedCollection || 'users'}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${project.api_key}'
  },
  body: JSON.stringify(${collectionSchema?.sampleData ? JSON.stringify(collectionSchema.sampleData, null, 4) : `{
    name: 'John Doe',
    email: 'john@example.com',
    age: 25
  }`})
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Record created:', data.data);
    }
  })
  .catch(error => console.error('Error:', error));`} />
              </>
            )}

            {selectedCodeTab === 'getAll' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900">Get All Records (GET)</h3>
                <CodeBlock code={`// Fetch all records from a collection
fetch('http://localhost:5000/api/${id}/users', {
  headers: {
    'x-api-key': '${project.api_key}'
  }
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Records:', data.data);
      console.log('Total count:', data.count);
    }
  })
  .catch(error => console.error('Error:', error));`} />
              </>
            )}

            {selectedCodeTab === 'getOne' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900">Get Single Record by ID (GET)</h3>
                <CodeBlock code={`// Fetch a specific record by ID
const recordId = 'YOUR_RECORD_ID';

fetch(\`http://localhost:5000/api/${id}/users/\${recordId}\`, {
  headers: {
    'x-api-key': '${project.api_key}'
  }
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Record:', data.data);
    }
  })
  .catch(error => console.error('Error:', error));`} />
              </>
            )}

            {selectedCodeTab === 'update' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900">Update a Record (PUT)</h3>
                <CodeBlock code={`// Update an existing record
const recordId = 'YOUR_RECORD_ID';

fetch(\`http://localhost:5000/api/${id}/users/\${recordId}\`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${project.api_key}'
  },
  body: JSON.stringify({
    name: 'Jane Doe',
    email: 'jane@example.com',
    age: 26
  })
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Record updated:', data.data);
    }
  })
  .catch(error => console.error('Error:', error));`} />
              </>
            )}

            {selectedCodeTab === 'delete' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900">Delete a Record (DELETE)</h3>
                <CodeBlock code={`// Delete a record
const recordId = 'YOUR_RECORD_ID';

fetch(\`http://localhost:5000/api/${id}/users/\${recordId}\`, {
  method: 'DELETE',
  headers: {
    'x-api-key': '${project.api_key}'
  }
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Record deleted successfully');
    }
  })
  .catch(error => console.error('Error:', error));`} />
              </>
            )}

            {selectedCodeTab === 'filter' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900">Filter & Query Records (GET)</h3>
                <CodeBlock code={`// Example 1: Exact match
fetch('http://localhost:5000/api/${id}/users?role=admin', {
  headers: { 'x-api-key': '${project.api_key}' }
})

// Example 2: Greater than / Less than
fetch('http://localhost:5000/api/${id}/users?age_gt=25&age_lt=50', {
  headers: { 'x-api-key': '${project.api_key}' }
})

// Example 3: Pagination
fetch('http://localhost:5000/api/${id}/users?page=1&limit=10', {
  headers: { 'x-api-key': '${project.api_key}' }
})

// Example 4: Combined filters
fetch('http://localhost:5000/api/${id}/users?role=admin&age_gt=21&limit=20', {
  headers: { 'x-api-key': '${project.api_key}' }
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Filtered records:', data.data);
    }
  });

// Available query operators:
// - field_gt: Greater than
// - field_lt: Less than
// - field_gte: Greater than or equal
// - field_lte: Less than or equal
// - field=value: Exact match
// - page & limit: Pagination`} />
              </>
            )}
          </div>

          {/* React Example */}
          {selectedCodeTab === 'getAll' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🔥 React Hook Example</h3>
              <CodeBlock code={`// Example: Using in a React component
import { useState, useEffect } from 'react';

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/${id}/users', {
      headers: { 'x-api-key': '${project.api_key}' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.data);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
}`} />
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Create Collection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Create Collection</h2>
          <form onSubmit={createCollection} className="space-y-4">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name (e.g., users, products)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Create Collection
            </button>
          </form>
          
          {collections.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Your Collections:</h3>
              <div className="space-y-2">
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setSelectedCollection(col.name)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      selectedCollection === col.name
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Record */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Add Record</h2>
          {selectedCollection ? (
            <form onSubmit={createRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSON Data for "{selectedCollection}"
                </label>
                <textarea
                  value={newRecordData}
                  onChange={(e) => setNewRecordData(e.target.value)}
                  placeholder='{"name": "John", "email": "john@example.com"}'
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
              >
                Add Record
              </button>
            </form>
          ) : (
            <p className="text-gray-500">Select a collection first</p>
          )}
        </div>
      </div>

      {/* Records Display */}
      {selectedCollection && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            Records in "{selectedCollection}" ({records.length})
          </h2>
          {records.length === 0 ? (
            <p className="text-gray-500">No records yet</p>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500">ID: {record.id}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(record.created_at).toLocaleString()}
                    </span>
                  </div>
                  <pre className="text-sm bg-gray-900 text-white p-3 rounded overflow-x-auto">
                    {JSON.stringify(record, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
