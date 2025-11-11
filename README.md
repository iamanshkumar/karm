# 🧩 Karm — Smart Task & Project Manager

**Karm** is a modern web application designed to help individuals and teams organize tasks visually using interactive boards, lists, and cards.  
It combines **intuitive drag-and-drop interaction**, a **clean glass-blur UI**, and a **powerful backend** — enabling you to plan, prioritize, and track your work effortlessly.

---

## 🚀 Overview

Karm turns your daily workflow into a simple visual layout.  
You can create **boards** for projects, add **lists** to represent stages (like “To Do”, “In Progress”, “Done”), and populate them with **cards** for tasks.  
Everything is **fully editable**, **draggable**, and **synchronized** with the backend.

---

## ✨ Core Features

### 👤 User System
- Secure authentication (JWT + bcrypt)
- Each user manages their own workspace and boards

### 📋 Boards & Lists
- Create multiple boards to organize different projects
- Add, rename, or delete lists dynamically
- Real-time UI updates and smooth transitions

### 🗂️ Cards
- Create cards with title and description
- Edit or delete cards easily
- Move cards between lists (drag & drop)
- View card details in a modern modal
- Backend sync ensures positions remain consistent

### 🧠 UX Highlights
- Modern **glassmorphic design** built with TailwindCSS
- **Blurred motion toasts** using React-Toastify
- **Drag-and-drop** powered by @hello-pangea/dnd
- Optimistic UI updates with automatic backend sync
- Fully responsive (desktop, tablet, mobile)


---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React 19, Tailwind CSS, @hello-pangea/dnd, React Router DOM, React Toastify |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Styling | TailwindCSS |

---

## 🛠️ Installation Guide

### Clone the repository
```bash
git clone https://github.com/<your-username>/trello-clone.git
cd trello-clone
```

### Install all the modules by the following commands
```bash
cd backend
npm install

cd ../frontend
npm install
```