# CareerGrow - MERN Stack Job Portal

A comprehensive job portal built with MongoDB, Express, React, and Node.js featuring job postings, applications, real-time chat, and skill-based recommendations.

## Features

- **Job Posting**: Employers can post jobs with detailed requirements
- **Applications**: Job seekers can apply to jobs, employers can manage applications
- **Real-time Chat**: Socket.io powered messaging between users
- **Skill-based Recommendations**: AI-powered job and candidate matching
- **User Authentication**: JWT-based authentication with role-based access
- **Profile Management**: Users can update their profiles with skills and experience

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Socket.io for real-time chat
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React 18
- React Router for navigation
- Material-UI for components
- Axios for API calls
- Socket.io-client for real-time features

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/careergrow
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
careergrow/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── socket/          # Socket.io configuration
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   └── App.js       # Main app component
│   └── public/          # Static files
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (employer only)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `GET /api/applications` - Get applications (filtered by role)
- `GET /api/applications/:id` - Get single application
- `POST /api/applications` - Create application
- `PUT /api/applications/:id/status` - Update application status
- `DELETE /api/applications/:id` - Delete application

### Chat
- `GET /api/chat` - Get all chats for user
- `POST /api/chat` - Create or get chat
- `GET /api/chat/:id` - Get chat with messages
- `PUT /api/chat/:id/read` - Mark messages as read

### Recommendations
- `GET /api/recommendations/jobs` - Get job recommendations (job seeker)
- `GET /api/recommendations/candidates` - Get candidate recommendations (employer)

## User Roles

- **job_seeker**: Can browse jobs, apply, chat, and view recommendations
- **employer**: Can post jobs, manage applications, chat, and view candidate recommendations
- **admin**: Full access to all features

## Features in Detail

### Job Posting
- Employers can create detailed job postings with:
  - Title, description, company, location
  - Required skills
  - Experience requirements
  - Salary range
  - Employment type

### Applications
- Job seekers can apply with cover letters
- Employers can review and update application status
- Status tracking: pending, reviewed, shortlisted, rejected, accepted

### Real-time Chat
- Socket.io powered messaging
- Direct communication between users
- Chat can be linked to specific jobs
- Typing indicators and read receipts

### Skill-based Recommendations
- **For Job Seekers**: Jobs are scored based on:
  - Skill matching (40%)
  - Experience matching (30%)
  - Job recency (20%)
  - Location preference (10%)

- **For Employers**: Candidates are scored based on:
  - Skill matching (50%)
  - Experience matching (30%)
  - Education (20%)

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

## License

MIT
