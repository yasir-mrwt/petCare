# 🐾 PetCare - Pet Care Management System

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-Deployed-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A full-stack web application for managing pet care appointments with authentication, admin dashboard, and real-time appointment tracking.**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [API](#-api-endpoints)

---

</div>

## 🎯 About

PetCare is a comprehensive pet care management system that allows pet owners to book appointments for various services including grooming, veterinary care, boarding, and training. The platform features user authentication, real-time appointment tracking, and an admin dashboard for managing bookings.

### Key Highlights

- 🔐 Secure authentication with session management
- 📅 Real-time appointment booking and tracking
- 👑 Admin dashboard for appointment management
- 📱 Fully responsive design for all devices
- 🔄 Live appointment counter with smooth animations
- ✉️ Contact form with instant notifications

## ✨ Features

### For Users
- **User Registration & Login** - Secure account creation with encrypted passwords
- **Service Selection** - Choose from 6 pet care services
- **Appointment Booking** - Schedule appointments with detailed pet information
- **Appointment Management** - View, track, and cancel appointments
- **Real-time Updates** - Live appointment counter in navigation
- **Contact Form** - Direct communication with the PetCare team

### For Admins
- **Admin Dashboard** - View all pending appointments
- **Appointment Actions** - Approve or reject appointment requests
- **User Management** - Access to all user appointments
- **Analytics** - Real-time appointment statistics

## 🚀 Live Demo

**Frontend:** [https://pet-care-five-ruby.vercel.app](https://pet-care-five-ruby.vercel.app)  
**Backend API:** [https://petcare-backend-production-ad73.up.railway.app](https://petcare-backend-production-ad73.up.railway.app)

**Demo Credentials:**
- **User:** Register your own account

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with gradients and animations
- **JavaScript (ES6+)** - Modern vanilla JS
- **Font Awesome** - Icon library
- **Animate.css** - CSS animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Relational database
- **bcrypt** - Password hashing
- **express-session** - Session management
- **CORS** - Cross-origin resource sharing

### Deployment
- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** Railway MySQL

## 📁 Project Structure

```
petcare/
├── client/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── app.js             # JavaScript logic
│   ├── app.css            # Styling
│   └── assets/            # Images and resources
│
├── server/                # Backend files
│   ├── server.js          # Express application
│   ├── package.json       # Dependencies
│   └── .env              # Environment variables
│
└── README.md             # Documentation
```

## 💻 Installation

### Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- Git

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/yasir-mrwt/petcare.git
cd petcare/server

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=3000
SESSION_SECRET=your-secret-key-change-in-production

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=petcare
DB_PORT=3306
DB_SSL=false

# Frontend URL
FRONTEND_URL=http://localhost:5500
EOF

# 4. Create MySQL database
mysql -u root -p
CREATE DATABASE petcare;
EXIT;

# 5. Start the server
npm start
```

The server will start on `http://localhost:3000` and automatically create tables.

### Frontend Setup

```bash
# 1. Navigate to client folder
cd ../client

# 2. Update API URL in app.js (line 1)
const API_URL = "http://localhost:3000";

# 3. Open with Live Server or any static server
# Using Python:
python -m http.server 5500

# Using Node.js http-server:
npx http-server -p 5500
```

Visit `http://localhost:5500`

## 🔑 Environment Variables

### Backend (.env)

```env
# Server Configuration
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-super-secret-key-min-32-chars

# Database Configuration
DB_HOST=your-railway-mysql-host
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=railway
DB_PORT=3306
DB_SSL=true

# CORS Configuration
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## 📡 API Endpoints

### Authentication

```http
POST   /api/register          # Register new user
POST   /api/login             # User login
POST   /api/logout            # User logout
GET    /api/check-auth        # Check authentication status
```

### Appointments

```http
POST   /api/appointments           # Create appointment (Auth required)
GET    /api/appointments           # Get user appointments (Auth required)
GET    /api/appointments/count     # Get appointment count (Auth required)
POST   /api/appointments/:id/cancel         # Cancel appointment (Auth required)
POST   /api/appointments/:id/status         # Update status (Admin only)
```

### Contact

```http
POST   /api/contact              # Send contact message
GET    /api/contact              # Get messages (Admin only)
```

### Health Check

```http
GET    /health                   # Server health status
```

## 🚢 Deployment

### Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   railway init
   
   # Add MySQL database
   railway add
   # Select: MySQL
   
   # Deploy
   railway up
   ```

3. **Set Environment Variables**
   - Go to Railway Dashboard → Your Project
   - Click on service → Variables
   - Add all variables from `.env`

4. **Get MySQL Credentials**
   - Click MySQL service → Variables
   - Copy: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - Update in backend service variables

### Deploy Frontend to Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Navigate to client folder
cd client

# 3. Update API_URL in app.js
const API_URL = "https://your-railway-backend.up.railway.app";

# 4. Deploy
vercel

# 5. Follow prompts
# - Setup new project: Yes
# - Project name: petcare
# - Directory: ./
```

### Post-Deployment

Update CORS in backend:

1. Railway Dashboard → Backend Service → Variables
2. Update `FRONTEND_URL` to your Vercel URL
3. Redeploy backend

## 🔐 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **Session Management** - Secure HTTP-only cookies
- **CORS Protection** - Whitelist specific origins
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Input sanitization
- **CSRF Protection** - SameSite cookie attribute

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  owner_email VARCHAR(255) NOT NULL,
  owner_phone VARCHAR(20) NOT NULL,
  owner_address TEXT NOT NULL,
  pet_name VARCHAR(255) NOT NULL,
  pet_type VARCHAR(50) NOT NULL,
  pet_breed VARCHAR(255) NOT NULL,
  pet_age INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  notes TEXT,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Contact Messages Table
```sql
CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 Features Walkthrough

### 1. User Registration
- Navigate to site
- Click user icon → Register tab
- Enter email and password
- Account created with 'user' role

### 2. Booking Appointment
- Login with credentials
- Click "Book Appointment"
- Fill in owner and pet details
- Select service type and date
- Submit form
- Appointment status: Pending

### 3. Managing Appointments
- Click appointment cart icon
- View all your appointments
- Cancel pending/rejected appointments
- See appointment status (pending/approved/rejected)

### 4. Admin Features
- Login as admin
- View all pending appointments
- Approve or reject requests
- Track appointment analytics

## 🐛 Troubleshooting

### Common Issues

**1. 401 Unauthorized Error**
```javascript
// Solution: Clear cookies and login again
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
});
```

**2. CORS Error**
- Check `FRONTEND_URL` in backend matches your frontend domain
- Ensure `credentials: 'include'` in all fetch requests

**3. Database Connection Failed**
- Verify MySQL credentials in `.env`
- Check if MySQL service is running
- Test connection: `mysql -h HOST -u USER -p`

**4. Session Not Persisting**
- Clear browser cache and cookies
- Check `secure` cookie setting (should be `true` in production)
- Verify `sameSite: 'none'` for cross-origin

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Test thoroughly before submitting
- Update README if needed

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

**Muhammad Yasir**

- GitHub: [@yasir-mrwt](https://github.com/yasir-mrwt)
- Email: yasirmarwat09@gmail.com
- LinkedIn: [Muhammad Yasir](https://linkedin.com/in/muhammad-yasir)

**Project Link:** [https://github.com/yasir-mrwt/petcare](https://github.com/yasir-mrwt/petcare)

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [MySQL](https://www.mysql.com/) - Reliable database system
- [Railway](https://railway.app/) - Simplified deployment platform
- [Vercel](https://vercel.com/) - Frontend hosting
- [Font Awesome](https://fontawesome.com/) - Icon library
- [Animate.css](https://animate.style/) - CSS animations

## 📈 Future Enhancements

- [ ] Email notifications for appointments
- [ ] Payment integration
- [ ] Pet health records
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] SMS reminders
- [ ] Real-time chat support
- [ ] Pet vaccination tracking

## 🔧 Admin Setup

### Making a User Admin

**Method 1: Direct MySQL Query**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

**Method 2: Railway MySQL Console**
1. Railway Dashboard → MySQL service → Data tab
2. Run: `UPDATE users SET role = 'admin' WHERE email = 'admin@petcare.com';`

**Method 3: Default Admin**
- Email: `admin@petcare.com`
- Password: `admin123`
- ⚠️ **Change password immediately in production!**

---

<div align="center">

**⭐ If you found this helpful, please star the repository!**

Made with ❤️ by [Muhammad Yasir](https://github.com/yasir-mrwt)

</div>
