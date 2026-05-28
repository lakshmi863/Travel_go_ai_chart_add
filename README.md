TravelGo is a full-stack flight booking web application built using MERN Stack and Django.
The system supports flight search, booking, seat selection, authentication, email notifications, and secure API protection.

The project is fully containerized using Docker and deployed with Nginx as a reverse proxy.

FrontEnd link( https://travel-go-ai-frontend.onrender.com/ )

Backend Node.js link( https://travelgo-v7ha.onrender.com )

Backend Django link( https://travelgo-django.onrender.com )

web site vedio link( https://drive.google.com/file/d/1xs7HlacaF97rW6pQlJfSNDYciN0MlsWO/view?usp=sharing )


Architecture :

<img width="1536" height="1024" alt="Architecture " src="https://github.com/user-attachments/assets/fd6a7438-3be3-4e0f-8a44-33a41094f2bc" />


HomePage

<img width="3548" height="2936" alt="travelgo-front onrender com_" src="https://github.com/user-attachments/assets/8d2b4319-2d6e-4d2e-a10d-22a5e4b9dd00" />

Flight section

<img width="3508" height="3220" alt="travelgo-front onrender com_flights" src="https://github.com/user-attachments/assets/3807f30a-205b-4035-84d1-b5b605492c65" />

Hotels:

<img width="1917" height="906" alt="image" src="https://github.com/user-attachments/assets/e300a3a7-fc1c-4712-86b3-32dd4e7b3ff8" />

Booking page:

<img width="3508" height="3340" alt="travelgo-front onrender com_booking" src="https://github.com/user-attachments/assets/3680bbfe-b9d7-4949-ae2c-f051e299b08c" />

MyBooking Page:

<img width="1912" height="785" alt="image" src="https://github.com/user-attachments/assets/686deeda-566d-41ea-a9db-8a640d601777" />



🚀 Tech Stack
🖥 Frontend

⚛️ React.js

Axios

HTML5

CSS3

JavaScript

⚙️ Backend (Node.js + Django)
🟢 Node.js + Express

RESTful APIs

JWT Authentication

Business Logic

Mongoose ORM

🐍 Django

Django REST Framework (DRF)

ORM & Model Management

Authentication System

Admin Panel

🗄 Database

MongoDB (Document Database)

🔐 Security Implementation

✅ Helmet (Secure HTTP Headers)

✅ Express Rate Limit (API Request Control)

✅ JWT Authentication

✅ Environment Variables (.env)

📧 Email Notification System

Nodemailer integration

Sends booking confirmation emails

User registration confirmation emails

Secure SMTP configuration

🐳 DevOps & Deployment

Docker

Docker Compose

Nginx (Reverse Proxy)

Multi-container Architecture

🏗 System Architecture
Client (React)
        ↓
Nginx (Reverse Proxy)
        ↓
Backend Layer
   ├── Node.js + Express APIs
   └── Django REST APIs
        ↓
MongoDB Database
        ↓
Email Service (Nodemailer / SMTP)
📂 Folder Structure
TravelGo/
│
├── frontend/                # React App
│
├── backend-node/            # Node + Express
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
├── backend-django/          # Django Project
│   ├── apps/
│   ├── models.py
│   ├── views.py
│   └── settings.py
│
├── nginx/
│   └── nginx.conf
│
├── docker-compose.yml
└── README.md
🌟 Core Features

🔐 Secure Authentication (JWT + Django Auth)

✈️ Flight Search & Booking

💺 Seat Selection System

📧 Email Confirmation System

🛡 Helmet Security Headers

🚦 API Rate Limiting

🐳 Fully Dockerized Architecture

🌍 Reverse Proxy with Nginx

🐳 Run with Docker
docker-compose up --build

Services included:

React Frontend

Node Backend

Django Backend

MongoDB

Nginx

🛠 Run Without Docker
Node Backend
cd backend-node
npm install
npm start
Django Backend
cd backend-django
pip install -r requirements.txt
python manage.py runserver
Frontend
cd frontend
npm install
npm start
