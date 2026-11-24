# AgriConnect — Deployment & DevOps Guide

## 1. Local Development Setup (Quickstart)

### Prerequisites
- Python 3.11+
- Node.js 18+ (v22 installed)
- npm 9+

### 1.1 Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m app.db.seed
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at: `http://localhost:8000/docs`

### 1.2 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend web application will run at: `http://localhost:5173`

---

## 2. Docker & Containerized Deployment

### 2.1 Multi-Container Stack (`docker-compose.yml`)
The stack comprises 3 isolated services:
1. `postgres:16`: PostgreSQL relational database container.
2. `backend`: FastAPI Python application with automatic migration and seeding.
3. `frontend`: Production Nginx serving built React Vite assets.

### 2.2 Execution Command
```bash
# Copy environment configuration
cp .env.example .env

# Build and start all services
docker compose up --build -d
```

### 2.3 Ports & Endpoints
- **Web App**: `http://localhost:5173` (or `http://localhost:80`)
- **Backend API Docs**: `http://localhost:8000/docs`
- **Database**: `localhost:5432`
