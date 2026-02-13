import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newProjectName })
      });

      const data = await response.json();
      
      if (data.success) {
        setProjects([data.data, ...projects]);
        setNewProjectName('');
      } else {
        setError(data.error || 'Failed to create project');
      }
    } catch (err) {
      setError('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const deleteProject = async (id) => {
    if (!confirm('Delete this project? All collections and data will be lost.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setProjects(projects.filter(p => p.id !== id));
      }
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
        <p className="text-gray-600 mt-2">
          Create a project to get your API key and start building
        </p>
      </div>

      {/* Create Project Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        <form onSubmit={createProject} className="flex gap-4">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project name (e.g., My App)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={creating}
          />
          <button
            type="submit"
            disabled={creating || !newProjectName.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {creating ? 'Creating...' : 'Create Project'}
          </button>
        </form>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
          <p className="text-gray-600">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/project/${project.id}`}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200"
                  >
                    Manage
                  </Link>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">API Key</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(project.api_key);
                      alert('API key copied!');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                   Copy
                  </button>
                </div>
                <code className="text-sm font-mono text-gray-800 break-all">
                  {project.api_key}
                </code>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
