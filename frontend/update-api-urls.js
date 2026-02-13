// Update script - Run this to see what needs to be changed
import fs from 'fs';

const filePath = './src/pages/ProjectDetail.jsx';
const content = fs.readFileSync(filePath, 'utf8');

// Replace relative URLs with API_BASE_URL
let updated = content;

// Replace fetch('/xxx with fetch(`${API_BASE_URL}/xxx
updated = updated.replace(/fetch\(`\/projects\//g, 'fetch(`${API_BASE_URL}/projects/');
updated = updated.replace(/fetch\('\/collections'/g, 'fetch(`${API_BASE_URL}/collections`');
updated = updated.replace(/fetch\(`\/api\//g, 'fetch(`${API_BASE_URL}/api/');
updated = updated.replace(/fetch\(`\/schema\//g, 'fetch(`${API_BASE_URL}/schema/');

// Replace hardcoded localhost URLs in code snippets
updated = updated.replace(/http:\/\/localhost:5000/g, '${API_BASE_URL}');

fs.writeFileSync(filePath, updated);
console.log('✅ Updated ProjectDetail.jsx');
