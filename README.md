# Zafaran — Online Food Ordering

A complete, fully functional prototype for an Online Food Ordering Web Application built with modern web technologies, now backed by MongoDB.

## 🛠️ Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB (with Mongoose ODM)
- **Styling:** Tailwind CSS (Custom luxury warm palette)
- **State Management:** Zustand (with persistence)
- **Internationalization:** next-intl (English & Arabic with RTL/LTR support)
- **Authentication:** NextAuth.js v4 (Stable)
- **Animations:** Framer Motion
- **Icons:** Lucide React

## 🚀 Features

1. **Bilingual Support (EN/AR):** Full RTL support with mirrored layouts and dynamic routing (`/en` and `/ar`).
2. **Real-time Database:** User data and authentication are now fully persisted in MongoDB.
3. **Interactive Menu:** Filterable categories, staggered animations, and quick-view modals.
4. **Smart Cart:** Slide-in drawer with persistent state, real-time total calculations, and delivery fee rules.
5. **Authentication:** Secure credential login with bcrypt hashing and auto-login after registration.
6. **Checkout Flow:** Validated multi-step form supporting both Online Payment and Cash on Delivery.
7. **Live Order Tracking:** Animated 4-stage order status tracker.
8. **Admin Dashboard:** Passcode-protected dashboard to manage menu items and update active order statuses.

## 📦 Prerequisites
- Node.js (v18.17+)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

## ⚙️ Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create or update your `.env.local` file:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-32-character-secret-key
   MONGODB_URI=your-mongodb-connection-string
   NEXT_PUBLIC_ADMIN_PASSCODE=admin123
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```

4. **Open the Application:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication Note
The application currently uses **Email/Password** authentication. Google OAuth is configured but can be toggled in `lib/auth.ts`. Make sure your `MONGODB_URI` is correctly set for registration and login to work.

## 🐳 Docker Deployment
The project includes a multi-stage `Dockerfile` and `docker-compose.yml` for production-ready containerization.
```bash
docker-compose up --build
```

## 🛠️ Admin Access
Navigate to `/admin` (e.g., `http://localhost:3000/en/admin`).
Use the passcode defined in `.env.local` (`NEXT_PUBLIC_ADMIN_PASSCODE`).

## 🌐 Switching Languages
Use the **"EN / AR"** toggle in the top navigation bar. This will instantly change the UI text and seamlessly flip the layout direction (LTR ↔ RTL).
