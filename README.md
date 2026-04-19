# 🏋️ FitFuel Supplement Store

Full-stack e-commerce store for supplements with persistent NeDB database.

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd backend && npm install
```

### 2. Start the server
```bash
PORT=8080 node src/index.js
```

### 3. Open the store
- Store: http://localhost:8080
- Admin: http://localhost:8080/admin  (password: admin123)
- API:   http://localhost:8080/api/healthz

---

## 📁 Project Structure
```
supplement-store/
├── backend/
│   ├── src/
│   │   ├── index.js          ← Main server entry
│   │   ├── lib/db.js         ← NeDB database
│   │   ├── middleware/auth.js ← Admin auth
│   │   └── routes/
│   │       ├── products.js   ← CRUD API
│   │       └── analytics.js  ← Stats + settings
│   ├── public/               ← Built frontend (auto-served)
│   ├── data/                 ← 🔒 Database files (NEVER deleted)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── StorePage.jsx   ← Main store + filters
    │   │   ├── ProductPage.jsx ← Product detail
    │   │   └── AdminPage.jsx   ← Admin panel
    │   └── lib/api.js          ← API client
    └── package.json
```

---

## ✅ Features
- **Persistent Storage**: NeDB - data survives all restarts/deploys
- **Products**: Full CRUD, bilingual (EN/AR), images, weights, categories
- **Filters**: Category, brand, price range, weight, search — all AJAX
- **Sorting**: Newest, price low→high, price high→low
- **Product Page**: Image gallery, weight selector, WhatsApp order
- **Admin Panel**: Manage products, view analytics, logs, system info
- **Visitor Counter**: Multiplied by configurable factor (default ×10)
- **Mobile Responsive**: Works on all screen sizes

---

## ⚙️ Environment Variables
| Variable | Default | Description |
|---|---|---|
| PORT | 8080 | Server port |

Admin password is set in the Admin → Settings panel (default: `admin123`)

---

## 🔄 Rebuild Frontend (after changes)
```bash
cd frontend && npm install && npm run build
```
The built files go to `backend/public/` and are served automatically.

---

## 🌐 Deploy on Replit
1. Upload this folder
2. Set `run` command: `cd backend && node src/index.js`
3. Set PORT env var to 8080
4. Data is saved in `backend/data/` — persistent across restarts ✅
