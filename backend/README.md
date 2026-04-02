# Backend — Frontend Modernization Migration Module

NestJS backend powering the migration platform. Handles GitHub OAuth, file uploads, JSP project analysis, and sensor/BMS data APIs.

---

## 🛠 Tech Stack

- **Framework**: NestJS (TypeScript)
- **Auth**: JWT + GitHub OAuth (Passport strategies)
- **Database**: MongoDB (Mongoose)
- **File Handling**: Multer
- **MQTT**: Real-time sensor data via MQTT broker
- **Python Server**: Separate Python service for BMS/IoT readings

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- MongoDB instance
- GitHub OAuth App credentials

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the `backend/` directory with the required variables:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/github-auth/callback
```

### Run

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

---

## 📁 Project Structure

```
src/
├── auth/               # JWT authentication (login, register, guards)
├── github-auth/        # GitHub OAuth flow
├── files/              # File upload handling (Multer)
├── sensors/            # Sensor data controllers & services (v1, v2)
├── bms-readings/       # BMS readings schema & service
├── mqtt/               # MQTT broker integration
├── user/               # User management
├── interceptors/       # Logging, error handling, caching, transform
├── middlewares/        # API versioning middleware
├── config/             # Environment config & validation
└── main.ts
```

---

## 🐍 Python Server

A separate Python service lives in `backend/python-server/` for IoT/BMS data processing:

```bash
cd backend/python-server
pip install -r requirements.txt
python main.py
```

---

## 🧪 Tests

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 📦 Build

```bash
npm run build
```
