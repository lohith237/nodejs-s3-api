# Node.js AWS Backend API

A production-ready Node.js/TypeScript REST API deployed on AWS EC2 with full cloud integration.

## 🚀 Live Demo
```
http://13.239.35.13
```

## 🛠️ Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT (JSON Web Tokens) + bcrypt
- **Cloud Storage:** AWS S3 (via multer-s3)
- **Email Service:** AWS SES
- **Deployment:** AWS EC2 (Ubuntu, t2.micro)
- **Process Manager:** PM2
- **Reverse Proxy:** Nginx
- **CI/CD:** GitHub Actions

## ✨ Features

- ✅ User Registration & Login with JWT Authentication
- ✅ Password hashing with bcrypt
- ✅ File upload to AWS S3 using multer-s3
- ✅ Automatic S3 cleanup on validation failures
- ✅ Transactional emails via AWS SES (login notifications, OTP)
- ✅ Nginx reverse proxy — clean URLs without port number
- ✅ PM2 process manager — 24/7 uptime with auto-restart
- ✅ GitHub Actions CI/CD — auto deploy on push to staging branch
- ✅ Staging & Production environment configuration

## 📁 Project Structure

```
src/
├── controllers/
│   └── userController.ts
├── middlewares/
│   └── AuthMiddleware.ts
├── modals/
│   └── User.ts
├── routes/
│   └── UserRoutes.ts
├── utils/
│   └── sendEmail.ts
├── types/
│   └── userTypes.ts
└── index.ts
config/
├── ConnectDB.ts
├── s3.ts
└── ses.ts
.github/
└── workflows/
    └── deploy.yml
```

## 🔧 Environment Variables

Create `.env.staging` file:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your_bucket_name
```

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/lohith237/nodejs-s3-api.git

# Install dependencies
cd nodejs-s3-api
npm install

# Build TypeScript
npm run build

# Run the app
node dist/src/index.js
```

## ☁️ AWS Architecture

```
User Request
     ↓
AWS EC2 (Ubuntu t2.micro)
     ↓
Nginx (Port 80) → Reverse Proxy
     ↓
Node.js App (Port 5000) → PM2
     ↓
MongoDB Atlas ← → AWS S3 ← → AWS SES
```

## 🚀 CI/CD Pipeline

Push to `staging` branch → GitHub Actions triggers automatically:

1. Checkout code
2. Install Node.js 22
3. Run `npm install`
4. Run `npm run build`
5. SSH into EC2
6. Pull latest code
7. Restart PM2

No manual deployment needed!

## 🔐 Security

- JWT tokens with expiry
- bcrypt password hashing
- AWS credentials stored in environment variables
- GitHub Secrets for CI/CD credentials
- S3 files cleaned up on validation failures

## 👨‍💻 Author

**Lohith Sairam Kandru**  
[GitHub](https://github.com/lohith237)
