
# 📌 Price Watch — Price Tracker App Marc

![React](https://img.shields.io/badge/React-Frontend-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express](https://img.shields.io/badge/Express-API-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-UI-06B6D4)
![Playwright](https://img.shields.io/badge/Playwright-Scraper-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

Price Watch is a full-stack web app that helps users **track product prices**, view **price history**, and receive **email notifications** when prices change.

---

## ✨ Features

- 🔐 Authentication (Signup / Login with token)
- 📦 Add products to track
- 📊 View price history chart
- ✏️ Edit tracked products
- 🗑️ Delete products
- 🌙 Dark / Light mode
- 🤖 Auto price scraping using **Playwright**
- 🔔 Email notifications when price drops or changes

---

## 🛠 Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS
- Chart.js
- react-hot-toast

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Playwright (scraper)
- Nodemailer (email notifier)




## 🛠️ Installation & Setup

Follow these steps to get **Price Watch** running locally:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/pricewatch.git
cd pricewatch
````

---

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

Start the backend server:

```bash
npm start
```

* Backend API runs at `http://localhost:5000`
* Handles authentication, product CRUD, price scraping, and email notifications

---

### 3. Setup the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

* Frontend dev server usually runs at `http://localhost:5173`
* Connects automatically to the backend API

---

### 4. Open in Browser

* Frontend: `http://localhost:5173`
* Backend API (optional testing): `http://localhost:5000`

---

## 📌 How It Works

1. User logs in and receives a token
2. User adds a product URL to track
3. Backend scrapes product prices using **Playwright**
4. Price updates are stored in MongoDB
5. If price changes → user receives email notification
6. Users can view price history anytime on the dashboard

---

## 🌍 Deployment

* Frontend → Vercel / Netlify
* Backend → Render
* Database → MongoDB Atlas

---


