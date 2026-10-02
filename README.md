# 🩸 LifeLine — Blood Donation & Emergency Matching Platform

LifeLine is a full-stack web platform designed to help hospitals find eligible and available blood donors during emergency situations.

The system allows donors to register their details, hospitals to create blood requests, and the platform to automatically identify matching donors based on blood group, city, availability, and recent donation history.

---

## 🎯 Project Objective

During blood emergencies, hospitals and patients may struggle to quickly identify suitable donors.

LifeLine aims to simplify this process by connecting:

- 🏥 Hospitals
- 🩸 Blood donors
- 🚨 Emergency blood requests

The platform provides a centralized system for registering donors and finding suitable matches quickly.

---

## ✨ Features

### 👤 Donor Management
- Register blood donors
- Store blood group and city
- Store donor availability
- Update donor availability
- View registered donors

### 🚨 Blood Requests
- Create emergency blood requests
- Specify required blood group
- Specify city
- Specify number of units
- Set urgency level
- View blood requests
- Mark requests as fulfilled

### 🔍 Automatic Donor Matching

LifeLine identifies matching donors using:

- Same blood group
- Same city
- Donor availability
- Donation eligibility based on the project's simplified 90-day rule

### 📊 Dashboard

The dashboard displays:

- Total donors
- Available donors
- Total blood requests
- Open requests

### ✅ Input Validation

The frontend validates important fields such as:

- Donor name
- Phone number
- Age
- City
- Blood group
- Hospital name
- Units required

### 📱 Responsive Design

The interface is designed to work across:

- Desktop
- Tablet
- Mobile devices

---

## 🛠️ Technology Stack

### Frontend
- React
- JavaScript
- HTML
- CSS
- Vite

### Backend
- Python
- FastAPI
- Uvicorn

### Database
- SQLite

### Development Tools
- Visual Studio Code
- Git
- GitHub

---

## 🏗️ Project Structure

```text
blood-donation-emergency-matching/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   └── blood_donation.db
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md