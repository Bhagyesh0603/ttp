# SimpleData API

> Instant REST API with persistent storage for frontend developers

## 🚀 Features

- ✅ Create projects and get API keys instantly
- ✅ Dynamic collections with auto-generated endpoints
- ✅ Full CRUD operations (POST, GET, PUT, DELETE)
- ✅ Query filtering (`?role=admin`, `?age_gt=20`)
- ✅ Pagination & sorting
- ✅ API key authentication
- ✅ Rate limiting (100 req/min)
- ✅ PostgreSQL with JSONB storage

## 📦 Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL (Aiven)
- Rate limiting & CORS

**Frontend:**
- Vite + React
- Tailwind CSS
- React Router

## 🛠️ Setup Instructions

### 1. Database Setup (Aiven PostgreSQL)

1. Go to your Aiven console
2. Create a PostgreSQL database
3. Copy the connection string
4. Run the schema from `backend/database/schema.sql` in your Aiven console

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
DATABASE_URL=your-aiven-connection-string
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start server:
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📖 API Documentation

### Project Management

**Create Project**
```bash
POST /projects
Body: { "name": "My App" }
Response: { api_key, project_id, base_url }
```

**Get All Projects**
```bash
GET /projects
```

### Collection Management

**Create Collection** (requires API key)
```bash
POST /collections
Headers: { "x-api-key": "your-key" }
Body: { "name": "users" }
```

**Get Collections**
```bash
GET /collections
Headers: { "x-api-key": "your-key" }
```

### Data Operations

**Create Record**
```bash
POST /api/{projectId}/{collection}
Headers: { "x-api-key": "your-key" }
Body: { "name": "John", "email": "john@example.com" }
```

**Get All Records**
```bash
GET /api/{projectId}/{collection}
Headers: { "x-api-key": "your-key" }

Query params:
?role=admin              # Exact match
?age_gt=20              # Greater than
?age_lt=50              # Less than
?limit=10&page=2        # Pagination
```

**Get Single Record**
```bash
GET /api/{projectId}/{collection}/{id}
Headers: { "x-api-key": "your-key" }
```

**Update Record**
```bash
PUT /api/{projectId}/{collection}/{id}
Headers: { "x-api-key": "your-key" }
Body: { "name": "Updated Name" }
```

**Delete Record**
```bash
DELETE /api/{projectId}/{collection}/{id}
Headers: { "x-api-key": "your-key" }
```

## 🎯 Example Usage

```javascript
// 1. Create project
const project = await fetch('http://localhost:5000/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'My App' })
}).then(r => r.json());

const apiKey = project.data.api_key;
const projectId = project.data.id;

// 2. Create collection
await fetch('http://localhost:5000/collections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  },
  body: JSON.stringify({ name: 'users' })
});

// 3. Add data
await fetch(`http://localhost:5000/api/${projectId}/users`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin'
  })
});

// 4. Query data
const users = await fetch(
  `http://localhost:5000/api/${projectId}/users?role=admin&limit=10`,
  { headers: { 'x-api-key': apiKey } }
).then(r => r.json());
```

## 🔐 Security Features

- API key authentication
- Rate limiting (100 req/min per API key)
- Request size limit (1MB)
- Input validation
- SQL injection prevention
- CORS protection

## 📊 Database Schema

```sql
projects
├── id (UUID)
├── name (VARCHAR)
├── api_key (VARCHAR, unique)
└── created_at (TIMESTAMP)

collections
├── id (UUID)
├── project_id (UUID, FK)
├── name (VARCHAR)
└── created_at (TIMESTAMP)

records
├── id (UUID)
├── collection_id (UUID, FK)
├── data (JSONB)
└── created_at (TIMESTAMP)
```

## 🚢 Deployment

**Backend:** Deploy to Railway/Render
**Frontend:** Deploy to Vercel/Netlify
**Database:** Already on Aiven

## 📝 License

MIT

## 👨‍💻 Author

Built as an industry-level portfolio project demonstrating:
- Multi-tenant architecture
- Dynamic routing & endpoints
- PostgreSQL JSONB queries
- REST API best practices
- Rate limiting & security
- Production-ready deployment
