# ⚡ SQL Practice App

An interactive, high-performance web application designed for practicing real-world SQL interview questions entirely in the browser. 

👉 **Live Demo:** [https://ejazanwar572.github.io/sql-practice-app/](https://ejazanwar572.github.io/sql-practice-app/)

---

## ✨ Features

- **67 Handpicked Interview Questions:** Organized by difficulty (**Easy**, **Medium**, **Hard**) from top tech companies (Amazon, Google, Meta, Uber, Stripe, LinkedIn).
- **Client-Side SQL Engine:** Uses **PGlite** (Postgres running in WebAssembly) for lightning-fast query execution directly in your browser tab. No backend database setup required.
- **Interactive UI/UX:**
  - **Dynamic Schema Viewer:** Easily inspect table schemas and structure.
  - **SQL Code Editor:** Real-time query execution with detailed error messages.
  - **Attempts History:** Logs your previous runs, execution times, and success status.
  - **Dynamic Progress Counter:** Shows total questions and remaining unsolved counts per difficulty.
- **Offline Progress Saving:** Persists your solved questions automatically via local storage.

---

## 🛠️ Tech Stack

- **Frontend:** React (TypeScript), Tailwind CSS
- **SQL Execution:** `@electric-sql/pglite` (Postgres in WebAssembly)
- **Bundler:** Vite
- **Deployment:** GitHub Actions & GitHub Pages

---

## 🚀 Getting Started Locally

To run the application locally on your machine:

### 1. Clone the repository
```bash
git clone https://github.com/ejazanwar572/sql-practice-app.git
cd sql-practice-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 📂 Project Structure

```
├── .github/workflows/   # CI/CD deployment configuration
├── src/
│   ├── data/
│   │   └── questions.ts # Core dataset of 67 questions, schemas, and solutions
│   ├── App.tsx          # Main interactive interface & state manager
│   ├── main.tsx         # React entrypoint
│   └── index.css        # Tailwind styles & global styling
├── vite.config.ts       # Bundler configuration (configured for WASM)
└── package.json         # Dependency manifest
```

---

## 📝 License

MIT License. Feel free to use this to study, learn, or extend for your own practice!
