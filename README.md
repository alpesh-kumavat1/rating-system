# 🏪 Store Rating Platform

A full-stack web application where users can register, login, view stores, and submit ratings (1 to 5).  
Built with **React (Frontend)**, **Node.js/Express (Backend)**, and **MySQL (Database)**.

---

## 🚀 Tech Stack
- **Frontend:** React.js  
- **Backend:** Node.js + Express.js  
- **Database:** MySQL  

---

## 🔑 Features

### 👨‍💼 System Administrator
- Add new stores, normal users, and admins  
- Dashboard: Total users, stores, ratings  
- View/filter users & stores  
- Logout  

### 👤 Normal User
- Signup & login  
- View and search stores  
- Submit/modify ratings (1–5)  
- Update password  
- Logout  

### 🏪 Store Owner
- Login  
- Dashboard: view users who rated, average rating  
- Update password  
- Logout  

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/alpesh-kumavat1/<repo-name>.git
cd <repo-name>
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```

- Create a `.env` file in `backend/` (use this example):
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=rating_platform

# App Configuration
PORT=5000
JWT_SECRET=your_jwt_secret
```

- Start the backend server:
```bash
npm start
```

---

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend will start on **http://localhost:3000**

---

### 4️⃣ Database Setup (MySQL)

Save this schema in `backend/database/schema.sql` and import it:

```sql
-- Create Database
CREATE DATABASE rating_platform;
USE rating_platform;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400),
    role ENUM('ADMIN', 'USER', 'OWNER') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores Table
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_email) REFERENCES users(email) ON DELETE SET NULL
);

-- Ratings Table
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    rating INT CHECK(rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE(user_id, store_id) -- one user can rate one store only once
);
```

👉 Import the schema:
```bash
mysql -u root -p < backend/database/schema.sql
```

---

## 📄 Example `.gitignore`

Add this in a `.gitignore` file to avoid uploading unnecessary files:
```
# Node modules
frontend/node_modules
backend/node_modules

# Logs
*.log

# Environment files
.env

# Build files
frontend/build
```

---

## 🗄️ Database Schema Summary

### Users Table
- id, name, email, password, address, role (ADMIN/USER/OWNER)

### Stores Table
- id, name, email, address, owner_email

### Ratings Table
- id, user_id, store_id, rating (1–5)

---


## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you’d like to change.

---

## 📜 License
This project is licensed under the MIT License.
