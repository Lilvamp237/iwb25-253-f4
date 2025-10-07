# iwb25-253-f4
Team F4 Project Repository for Innovate with Ballerina 2025

**Localloop** is a **full-stack Ballerina + Vite project** designed to demonstrate seamless communication between a robust backend API service and a lightweight modern frontend interface.  
The project highlights how Ballerina can be used to handle service orchestration, API management, and data processing, while the frontend (built with Vite) provides a fast and responsive user experience.

---

## 🚀 Features

- ⚡ **Ballerina Backend:** REST API service for data exchange and logic handling  
- 🖥️ **Vite Frontend:** Lightning-fast and modular UI development  
- 🔄 Real-time data flow between frontend and backend  
- 🧩 Clean project separation with easy configuration and deployment  
- 🧠 Demonstrates modern service integration using Ballerina  

---

## 🧠 Project Structure

```

localloop/
├── backend/              # Ballerina backend service
│   ├── main.bal
│   ├── Config.toml
│   └── tests/
│
├── frontend/             # Vite-based frontend
│   ├── index.html
│   ├── package.json
│   ├── src/
│   └── vite.config.js
│
└── README.md

````

---

## ⚙️ Prerequisites

Before running the project, make sure you have:

- [Ballerina](https://ballerina.io/downloads/) `v2201.9.0` or above  
- [Node.js](https://nodejs.org/en/download/) `v18` or above  
- [npm](https://www.npmjs.com/) (comes with Node.js)  
- (Optional) [Visual Studio Code](https://code.visualstudio.com/) with Ballerina and frontend extensions

---

## 🧩 Setup & Run

### 🛠️ 1. Clone the repository
```bash
git clone https://github.com/<your-username>/localloop.git
cd localloop
````

---

### 🧱 2. Run the Backend (Ballerina)

```bash
cd backend
bal run
```

The backend will start on **[http://localhost:9090](http://localhost:9090)** (default).
You can test it using:

```bash
curl http://localhost:9090/localloop/health
```

---

### 🎨 3. Run the Frontend (Vite)

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

By default, the frontend runs on **[http://localhost:5173](http://localhost:5173)** and communicates with the backend.

---

### 🔍 4. Access the Application

Once both are running:

* 🌐 Frontend: [http://localhost:5173](http://localhost:5173)
* ⚙️ Backend API: [http://localhost:9090](http://localhost:9090)

---

## 🧪 Testing

To run backend test cases:

```bash
cd backend
bal test
```

Frontend tests (if any) can be added and run using:

```bash
npm run test
```

---

## 🧰 Technologies Used

| Layer             | Technology                         |
| ----------------- | ---------------------------------- |
| Backend           | [Ballerina](https://ballerina.io/) |
| Frontend          | [Vite](https://vitejs.dev/)        |
| Language          | JavaScript / Ballerina             |
| API Communication | REST (HTTP)                        |

---

## 💡 Future Improvements

* 🧩 Add Docker for full-stack containerized deployment
* 📊 Connect to a database for persistent storage
* 🌍 Deploy frontend and backend to cloud environments
* 🧠 Add real-time event handling with WebSockets

---

## 👨‍💻 Author

**Sumudu Ishadi Ratnayake**
📧 [Your email or GitHub link here]
💼 [LinkedIn or Portfolio link]

---

## 🪪 License

This project is open source and available under the [MIT License](LICENSE).

```

---

✅ This version:
- Professionally describes the **purpose and tech stack**
- Clearly explains **setup for both backend and frontend**
- Looks clean on GitHub (sections + emojis + code blocks)
- Perfect for your **portfolio and university project submissions**

---

Would you like me to make it slightly more **personalized** (e.g., what Localloop *actually does* — such as local API routing, service discovery, or event handling)?  
That’ll make the “About” section stronger and more project-specific.
```
