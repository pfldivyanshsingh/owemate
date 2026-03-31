# OweMate 🤝

> Split bills, not friendships. A full-stack group expense splitter.

[![Tech Stack](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![Tech Stack](https://img.shields.io/badge/Node.js-Express-green)](https://expressjs.com)
[![Tech Stack](https://img.shields.io/badge/Supabase-PostgreSQL-orange)](https://supabase.com)

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment

**Server** – edit `server/.env`:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=your_64_char_secret
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
CLIENT_URL=http://localhost:5173
```

**Client** – edit `client/.env`:
```
VITE_SERVER_URL=http://localhost:5000
```

### 3. Set Up Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste the contents of `supabase_schema.sql`
3. Run the schema to create all tables

### 4. Run Development Servers

```bash
# Terminal 1 – Start backend
cd server && npm run dev

# Terminal 2 – Start frontend
cd client && npm run dev
```

App will be available at **http://localhost:5173**

---

## 🏗️ Architecture

```
OweMate/
├── client/                  # React + Tailwind CSS (Vite)
│   └── src/
│       ├── pages/           # All app pages
│       ├── components/      # Reusable components  
│       ├── contexts/        # Auth + Socket contexts
│       └── services/        # API service layer
├── server/                  # Node.js + Express
│   └── src/
│       ├── controllers/     # Route handlers
│       ├── middleware/       # JWT + RBAC auth
│       ├── routes/          # Express routers
│       ├── services/        # Email (Resend)
│       └── socket/          # Socket.io handlers
└── supabase_schema.sql      # Database schema
```

## 🔐 Auth Flow

1. **Signup** → Hashed password stored → Verification email sent via Resend
2. **Email Click** → Token validated → Account activated
3. **Login** → bcrypt compare → JWT issued → Stored in localStorage
4. **Protected Routes** → JWT middleware validates on every request

## 💸 Split Methods

| Method | Description |
|--------|-------------|
| Equal | Divided equally among all members |
| Unequal | Custom amounts per person |
| Percentage | Custom % per person |
| Selective | Equal split among selected members only |

## ⚡ Real-time Events (Socket.io)

| Event | Description |
|-------|-------------|
| `expense_added` | New expense in group |
| `expense_updated` | Expense modified |
| `expense_deleted` | Expense removed |
| `payment_settled` | Settlement recorded |
| `member_added` | New member joined |
| `notification` | In-app notification |

## 👑 Roles

| Role | Permissions |
|------|-------------|
| Normal User | View/add expenses, view balances |
| Group Admin | Remove members, rename/delete group |
| Platform Admin | Access analytics dashboard |

## 📦 Deployment

| Service | Platform |
|---------|----------|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) |
| Database | [Supabase](https://supabase.com) |
| Email | [Resend](https://resend.com) |

## 🛡️ Business Rules

- ✅ Email must be verified before login
- ✅ Cannot leave group with pending dues
- ✅ Group admin cannot delete if any dues exist
- ✅ Only platform admins see the admin dashboard
- ✅ Invites require explicit acceptance
