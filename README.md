# 📝 Bloggerg — Minimal Daily Blogging App

**Bloggerg** is a minimalist personal blogging platform built entirely in one night — a project born out of pure curiosity, caffeine, and creativity.
It allows a single author to post one blog per day while enabling readers to view and comment publicly.

---

## 🚀 Live Demo

🔗 **[Bloggerg Live Website](https://bloggerg.netlify.app/)**
💬 Visit to read daily posts or drop your thoughts in the comments section.

---

## ✨ Features

✅ **Daily Blogging System** — One post per day rule (enforced in Supabase schema)
✅ **Public Comments** — Anyone can share thoughts or feedback
✅ **Secure Auth** — Only the owner (author) can post or edit blogs
✅ **Responsive Design** — Built with TailwindCSS for modern, mobile-first UI
✅ **Supabase Integration** — Handles database, authentication, and RLS policies
✅ **Deployed on Netlify** — Lightning-fast, reliable hosting

---

## 🧩 Tech Stack

| Layer           | Technology Used    |
| --------------- | ------------------ |
| Frontend        | React + TypeScript |
| Styling         | TailwindCSS        |
| Database & Auth | Supabase           |
| Hosting         | Netlify            |
| Version Control | Git & GitHub       |
| Icons           | Lucide React       |

---

## ⚙️ Setup & Installation

Follow these steps to run the project locally:

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/bloggerg.git
cd bloggerg
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the project root and add your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4️⃣ Run Development Server

```bash
npm run dev
```

Then open:
👉 [http://localhost:5173](http://localhost:5173)

---

## 🛠️ Supabase Setup

You can create your Supabase project and apply the schema from
`/supabase/migrations/20251106013457_create_bloggerg_schema.sql`

The schema includes:

* `posts` table (for daily posts)
* `comments` table (for user comments)
* Row Level Security (RLS) policies for secure data access

---

## 🌐 Deployment (Netlify)

1. Push your code to GitHub
2. Connect your repo in [Netlify Dashboard](https://app.netlify.com/)
3. Add these Environment Variables in Netlify settings:

   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
4. Set build command:

   ```
   npm run build
   ```
5. Set publish directory:

   ```
   dist
   ```
6. Redeploy and access your live site!

---

## 🧠 Inspiration

> “What if I could build my own personal blogging site — just for me, to post one story every day — and make it live tonight?”

That idea led to **Bloggerg**, a one-night coding journey filled with Supabase schema errors, environment variable hunts, and lots of coffee — but ultimately, success.

---

## 🪄 Future Enhancements

* 🗓️ Multi-user support
* 💬 Comment moderation
* 📸 Post thumbnails
* 📱 Mobile app version

---

## 💻 Author

**Ser Ali**
📧 [dev.serali@gmail.com](mailto:dev.serali@gmail.com)
🌐 [https://bloggerg.serali.tech]([https://bloggerg.netlify.app/])
🔗 [LinkedIn](https://www.linkedin.com/in/serali/)

---

## 🧾 License

This project is licensed under the **MIT License** — feel free to use, modify, and share with credit.

---

⭐ If you like this project, don’t forget to give it a **star** on GitHub and share your thoughts in the comments section on [Bloggerg](https://bloggerg.serali.tech)!
