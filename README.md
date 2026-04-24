# 🤖 Dhruvik AI Assistant

A personal AI chatbot built using **Next.js**, designed to answer questions about Dhruvik — including bio, skills, projects, and contact information — with a clean UI and smart routing system.

---

## 🚀 Features

* 🧠 Smart intent detection (bio, contact, skills, etc.)
* ⚡ Fast responses using Groq API
* 🎯 Personalized assistant behavior
* 💬 Clean chat UI with typing animation
* 📱 Responsive design (mobile + desktop)
* 🔒 Secure API handling using environment variables

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React
* **Backend:** API Routes (Node.js)
* **Styling:** Tailwind CSS
* **AI:** Groq API
* **Deployment:** Vercel

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/Dhruvik8849/Personal-ai-chatbot.git
cd Personal-ai-chatbot
```

Install dependencies:

```bash
npm install
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory and add:

```env
GROQ_API_KEY=your_api_key_here
```

⚠️ **Important:**

* Do NOT commit your API key to GitHub
* Keep `.env.local` private

---

## ▶️ Run Locally

```bash
npm run dev
```

App will run at:

```text
http://localhost:3000
```

---

## 🌐 Deployment

This project is deployed using **Vercel**.

Steps:

1. Push code to GitHub
2. Import project in Vercel
3. Add `GROQ_API_KEY` in environment variables
4. Click Deploy

---

## 📁 Project Structure

```
app/            # Next.js app router
components/     # UI components
lib/            # Core logic (agent, tools, profile)
data/           # Static data
public/         # Assets
```

---

## 🧠 How It Works

* User input is analyzed using custom routing logic
* If query matches a known intent → tool is triggered
* Otherwise → fallback to LLM response
* Final output is formatted into a natural reply

---

## 📌 Future Improvements

* 🔐 API rate limiting
* 🧠 Better context memory
* 🎨 UI enhancements (animations, themes)
* 🌍 Multi-language support

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub.

---
