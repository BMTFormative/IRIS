# 🚀 Job Matching Integration Guide

## 📁 Step 1: Backend Integration (No Database Required)

### 1.1 Create New Backend Files

**Add these new files to your backend:**

```bash
# Create the O3 client
backend/app/core/o3_client.py                 # O3 OpenAI client integration
backend/app/api/routes/job_matching.py        # Job matching API routes
backend/app/models/job_matching.py            # Pydantic models
```

**Create directories if they don't exist:**

```bash
mkdir -p backend/app/core
mkdir -p temp_uploads  # For CV file storage
```

### 1.2 Update Existing Backend Files

**1. Update `backend/app/api/main.py`** - Add job matching routes:

```python
# Add this import at the top
from app.api.routes import items, login, private, users, utils, job_matching

# Add this line after the existing router includes
api_router.include_router(job_matching.router)
```

**2. Update `backend/.env`** - Add OpenAI configuration:

```env
# Add these lines to your .env file
OPENAI_API_KEY=your-openai-api-key-here
```

**3. Update `backend/requirements.txt` or `pyproject.toml`** - Add dependencies:

```txt
# Add these dependencies
openai>=1.0.0
PyPDF2>=3.0.0
python-docx>=0.8.11
```

### 1.3 Install Backend Dependencies

```bash
cd backend
# If using pip:
pip install openai PyPDF2 python-docx

# If using uv (which your template uses):
uv add openai PyPDF2 python-docx
```

## 📱 Step 2: Frontend Integration (Material-UI)

### 2.1 Create New Frontend Files

**Add this new file:**

```bash
frontend/src/routes/_layout/job-matching.tsx  # Main job matching page
```

### 2.2 Install Frontend Dependencies

```bash
cd frontend
npm install react-dropzone
```

Your template already has Material-UI installed, so no additional UI dependencies needed!

### 2.3 Update Frontend Navigation (Optional)

**Update `frontend/src/components/Common/Sidebar.tsx` or your navigation component** to add a job matching link:

```typescript
// Add this import if not already imported
import { Work as WorkIcon } from '@mui/icons-material';

// Add this to your navigation items
{ icon: WorkIcon, title: "Job Matching", path: "/job-matching" },
```

## ⚙️ Step 3: Environment Configuration

### 3.1 Backend Environment

**Update `backend/.env`:**

```env
# Existing variables...
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Optional: Customize upload settings
MAX_UPLOAD_SIZE=10485760  # 10MB
TEMP_UPLOAD_DIR=temp_uploads
```

### 3.2 Frontend Environment

**Update `frontend/.env` (if it exists) or `frontend/.env.local`:**

```env
# This should point to your backend API
VITE_API_URL=http://localhost:8000
```

## 🔗 Step 4: Route Registration

### 4.1 Backend Route Registration

The job matching routes will automatically be available at:

- `GET /api/v1/job-matching/health` - Health check
- `POST /api/v1/job-matching/upload-cvs` - Upload CV files
- `POST /api/v1/job-matching/analyze` - Analyze candidates

### 4.2 Frontend Route Registration

The route is automatically registered via the file-based routing system. It will be available at:

- `/job-matching` - Main job matching interface

## 📊 Step 5: Testing Your Integration

### 5.1 Backend Testing

```bash
# Start your backend
cd backend
uvicorn app.main:app --reload

# Test health endpoint
curl http://localhost:8000/api/v1/job-matching/health
```

### 5.2 Frontend Testing

```bash
# Start your frontend
cd frontend
npm run dev

# Navigate to: http://localhost:5173/job-matching
```

### 5.3 Full Integration Test

1. **Go to** `http://localhost:5173/job-matching`
2. **Fill in** job title: "Senior Software Engineer"
3. **Add** job description: "Looking for a senior developer with React and Python experience"
4. **Set** mandatory conditions: "5+ years experience, React expertise"
5. **Upload** some test CV files (PDF, DOCX, or TXT)
6. **Click** "Launch IRIS Analysis"
7. **Verify** you get analysis results

## 🛠️ Step 6: File Structure After Integration

```
your-project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── job_matching.py          # ✅ NEW
│   │   │   │   ├── main.py                  # ✅ UPDATED
│   │   │   │   └── ... existing files
│   │   ├── core/
│   │   │   ├── o3_client.py                 # ✅ NEW
│   │   │   └── ... existing files
│   │   ├── models/
│   │   │   ├── job_matching.py              # ✅ NEW
│   │   │   └── ... existing files
│   ├── .env                                 # ✅ UPDATED
│   └── requirements.txt                     # ✅ UPDATED
├── frontend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── _layout/
│   │   │   │   ├── job-matching.tsx         # ✅ NEW
│   │   │   │   └── ... existing files
│   ├── package.json                         # ✅ UPDATED
│   └── .env                                 # ✅ UPDATED
├── temp_uploads/                            # ✅ NEW (auto-created)
└── ... existing files
```

## 🔧 Step 7: Troubleshooting

### Common Issues:

**❌ "O3 client not initialized"**

- Check your `OPENAI_API_KEY` in backend `.env`
- Verify the API key is valid and has access to GPT-4 or O3 models

**❌ "Module not found" errors**

- Make sure you installed the new dependencies: `openai`, `PyPDF2`, `python-docx`
- Restart your backend server after installing

**❌ File upload fails**

- Check the `temp_uploads` directory exists and has write permissions
- Verify file size limits (default 10MB)

**❌ Frontend build errors**

- Install `react-dropzone`: `npm install react-dropzone`
- Make sure Material-UI dependencies are installed

**❌ CORS errors**

- Verify your backend CORS settings allow your frontend origin
- Check `FRONTEND_HOST` in backend `.env`

## 🎯 Step 8: Production Considerations

### Security

- Use environment variables for API keys
- Implement proper file validation
- Add rate limiting for API endpoints

### Storage

- Consider using cloud storage (AWS S3, etc.) instead of local temp files
- Implement cleanup jobs for old uploaded files

### Scaling

- Add Redis for caching analysis results
- Implement background job processing for large files
- Add user authentication/authorization

---

## ✅ Migration Complete!

After following these steps, you'll have:

- ✅ **Backend API** with job matching endpoints
- ✅ **File upload** functionality for CVs (PDF, DOCX, TXT)
- ✅ **OpenAI O3 integration** for candidate analysis
- ✅ **Material-UI frontend** matching the design
- ✅ **File-based storage** (no database required)
- ✅ **Real-time analysis** with progress indicators
- ✅ **Professional UI** with drag & drop, results display

Your job matching system is now fully integrated! 🚀
