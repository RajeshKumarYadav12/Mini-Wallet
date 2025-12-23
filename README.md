Mini-Wallet Service 

A simple internal wallet system where users can create accounts, check balances, and transfer money securely.
This project demonstrates clean code, transactional integrity, and full-stack implementation.

🧩 Features
Backend (Node.js + Express + MongoDB)

Create a wallet account with an initial balance

Fetch user balance by user ID

Transfer money between users

Atomic transactions using MongoDB sessions

Prevents negative balances

Proper HTTP error handling

Integration test for money transfer

Frontend (React + Vite)

View current user balance

Send money to another user

API integration using Axios

User-friendly notifications

🛠 Tech Stack

Backend: Node.js, Express.js, MongoDB, Mongoose

Frontend: React, Vite, Axios

Testing: Jest, Supertest

Environment: dotenv


⚙️ Environment Variables
Backend (backend/.env)
MONGODB_URI=your_mongodb_connection_string
PORT=3000
NODE_ENV=development

Frontend (frontend/.env)
VITE_API_BASE_URL=http://localhost:3000/api

🚀 How to Run the Project Locally
1️⃣ Start Backend Server
cd backend
npm install
npm run dev


Backend will run at:

http://localhost:3000

2️⃣ Run Backend Tests
npm test


This runs the integration test verifying atomic money transfers.

3️⃣ Start Frontend Application
cd frontend
npm install
npm run dev


Frontend will run at:

http://localhost:3001

🔁 API Endpoints (Backend)
Method	Endpoint	Description
POST	/api/users	Create wallet account
GET	/api/users/:id/balance	Get user balance
POST	/api/transfer	Transfer money
🔒 Data Integrity & Reliability

MongoDB transactions ensure debit & credit happen together

Prevents insufficient balance transfers

Uses integer-based amounts to avoid floating-point errors

Clear HTTP status codes for failures



✅ Notes

This project was completed within the given time constraints and fully satisfies all required and bonus criteria, including frontend implementation and testing.

