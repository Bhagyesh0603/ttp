import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Instant Backend for Frontend Developers
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Create REST APIs with persistent storage in under 2 minutes. 
          No backend setup, no database configuration, just API keys and endpoints.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/dashboard"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started Free
          </Link>
          <a
            href="#features"
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-gray-900 text-white p-6 rounded-lg mb-16 max-w-3xl mx-auto">
        <div className="text-sm mb-2 text-gray-400">Example: Create and use your API</div>
        <pre className="overflow-x-auto">
          <code>{`// 1. Create a project (get API key)
fetch('/projects', {
  method: 'POST',
  body: JSON.stringify({ name: 'My App' })
})

// 2. Create a collection
fetch('/collections', {
  method: 'POST',
  headers: { 'x-api-key': 'your-key' },
  body: JSON.stringify({ name: 'users' })
})

// 3. Use your instant API
fetch('/api/project-id/users', {
  method: 'POST',
  headers: { 'x-api-key': 'your-key' },
  body: JSON.stringify({
    name: 'John',
    email: 'john@example.com'
  })
})`}</code>
        </pre>
      </div>

      {/* Features */}
      <div id="features" className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold mb-2">Instant Setup</h3>
          <p className="text-gray-600">
            Create projects and collections through simple API calls. No configuration files, no deployment hassles.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">Powerful Queries</h3>
          <p className="text-gray-600">
            Filter, sort, and paginate your data with URL parameters. Supports operators like _gt, _lt, and more.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl mb-4">🔐</div>
          <h3 className="text-xl font-semibold mb-2">Secure by Default</h3>
          <p className="text-gray-600">
            API key authentication, rate limiting, and data isolation ensure your data stays protected.
          </p>
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-white p-8 rounded-lg shadow-sm mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Perfect For</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-xl">✓</div>
            <div>
              <h4 className="font-semibold">Hackathons</h4>
              <p className="text-gray-600">Focus on frontend, get backend instantly</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-xl">✓</div>
            <div>
              <h4 className="font-semibold">Prototyping</h4>
              <p className="text-gray-600">Test ideas without backend setup</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-xl">✓</div>
            <div>
              <h4 className="font-semibold">Learning</h4>
              <p className="text-gray-600">Practice API integration with real data</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-xl">✓</div>
            <div>
              <h4 className="font-semibold">MVPs</h4>
              <p className="text-gray-600">Launch faster, migrate later</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
        <p className="text-gray-600 mb-6">Start creating your API in less than 2 minutes</p>
        <Link
          to="/dashboard"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Create Your First Project
        </Link>
      </div>
    </div>
  );
}
