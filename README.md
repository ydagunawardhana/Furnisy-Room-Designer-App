# 🛋️ Furnisy - 3D Furniture Room Designer Store & Admin Portal

A web-based 3D furniture e-commerce and interactive room designer application. Developed by the PUSL3122 coursework [GROUP-52]

## 📖 Project Overview
**Furnisy** is a modern, interactive e-commerce platform designed to revolutionize the way users shop for furniture. This project was developed as part of a Human-Computer Interaction (HCI) coursework. It features a unique **3D Room Designer** that allows users to visualize furniture in a virtual space before purchasing. The system consists of two main applications: a Customer-facing Frontend and a powerful Admin Dashboard.

## ✨ Key Features

### 🛒 User Application (`user_frontend`)
* **Interactive 3D Room Designer:** Users can drag, drop, and arrange 3D furniture models in a customizable virtual room.
* **Save & Load Designs:** Authenticated users can save their customized 3D room layouts and revisit them later.
* **E-commerce Functionality:** Complete shopping experience with a product catalog, shopping cart, and secure checkout process.
* **User Authentication:** Secure login and registration powered by Firebase Auth.
* **Responsive UI:** Fully responsive and accessible design for both desktop and mobile devices.

### 🛡️ Admin Application (`admin_frontend`)
* **Comprehensive Dashboard:** Real-time metrics including total revenue, active orders, customer count, and average order value (AOV).
* **Live Analytics:** Monthly sales and revenue tracking with interactive charts (ApexCharts).
* **Order Management:** View recent orders, track delivery statuses, and manage customer purchases.
* **Product & Category Management:** Add, edit, or remove products and manage stock levels (Out of stock alerts).
* **Dynamic Settings:** Manage store information, update admin profiles, and customize store settings.

## 🛠️ Tech Stack
* **Frontend Framework:** React.js + Vite
* **Styling:** Tailwind CSS
* **3D Rendering:** Three.js / React Three Fiber (For Room Designer)
* **Backend & Database:** Firebase (Firestore, Authentication)
* **Charts:** ApexCharts
* **Icons:** React Icons / Lucide React

## 📂 Project Structure
This repository is a monorepo containing both the user and admin applications.

```text
Furnisy-Project/
│
├── admin_frontend/       # Admin Dashboard Application
│   ├── src/              # React source code (Components, Pages, etc.)
│   ├── public/           # Static assets (Images, SVGs)
│   └── package.json      # Admin dependencies
│
└── user_frontend/        # Customer E-commerce Application
    ├── src/              # React source code (3D Designer, Cart, etc.)
    ├── public/           # 3D Models (.glb/.gltf) and assets
    └── package.json      # User dependencies
```
## 🚀 Getting Started
To run this project locally, follow these steps:

## 1. Prerequisites
Ensure you have Node.js (v16 or higher) installed on your machine.

## 2. Clone the Repository
```text
git clone [https://github.com/ydagunawardhana/Furnisy-Room-Designer-App.git]
cd furnisy-room-designer-app
```
## 3. Run the User Application
Open a terminal and navigate to the user frontend directory:
```
Bash

cd user_frontend
npm install
npm run dev
```
The User App will typically run on http://localhost:5173

## 4. Run the Admin Application
Open a new terminal window and navigate to the admin frontend directory:
```
Bash

cd admin_frontend
npm install
npm run dev
```
The Admin App will typically run on http://localhost:5174

## 👨‍💻 Developed By
Developed as part of an HCI Coursework Project.
