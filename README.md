# 📊 DataVista – Smart Data Analysis Dashboard

**DataVista** is an intuitive and interactive data analysis dashboard that empowers users to upload datasets (CSV or JSON), explore data insights, and uncover hidden trends effortlessly. Designed for data enthusiasts, analysts, and developers, DataVista streamlines exploratory data analysis (EDA) by offering a no-code interface to visualize and interpret datasets within seconds.

![image](https://github.com/user-attachments/assets/464a69f3-3196-4eea-a3ef-9eae3555f779)


---

## 🚀 Features

- 📁 **File Upload**: Upload CSV or JSON datasets via a simple UI.
- 📈 **Data Overview**:
  - View total records and columns
  - Detect missing/null values per column
- 🔍 **Smart Insights**:
  - Identify key patterns and trends
  - Detect data types and structure
  - View summary statistics for numerical and categorical fields
- 📊 **Visualizations**:
  - Generate charts: bar, pie, line
  - Visualize null values and distributions
- 🤖 **Predictive Suggestions**:
  - Get smart column-level predictions and insights using AI models
- 🔒 **Authentication**:
  - Secure, user-specific file uploads

---

## 🧰 Tech Stack

| Frontend     | Backend       | Data Processing           | Auth & Hosting       |
|--------------|---------------|---------------------------|----------------------|
| Next.js      | Node.js       | Python (Pandas, NumPy)    | Firebase             |
| Tailwind CSS | RESTful APIs  | Matplotlib, Scikit-learn  | Render, MongoDB      |
| Chart.js     | Express.js    |                           |                      |

---

## 📦 Installation & Usage

### 1. Clone the Repository

```bash
git clone https://github.com/jain-anshika/datavista.git
cd datavista
````

### 2. Install Dependencies

```bash
# Frontend (Next.js)
cd frontend/datavista
npm install

# Backend (Node.js + Python integration)
cd ../backend
npm install
```

### 3. 🔐 Replace these with your actual Firebase project credentials

Copy `.env.example` to `.env` replace placeholder values with your firebase project API Keys.

### 4. Run the Application

```bash
# Start the backend server
cd backend
npm start

# In a new terminal, start the frontend
cd ../frontend/datavista
npm run dev
```

> App runs locally at: `http://localhost:3000`

---

## ⚙️ Core Functionalities

| Feature                | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| File Upload            | Upload CSV or JSON files                               |
| Data Summary           | View row/column counts, types, and null value analysis |
| Visualizations         | Interactive charts for distributions and trends        |
| Missing Value Analysis | Highlight and analyze missing/null values              |
| Predictive Insights    | AI-powered suggestions for insights or predictions     |

---

## 🧑‍💻 Contributing

We welcome contributions! 🙌

1. Fork the repository
2. Create a new branch:

   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit:

   ```bash
   git commit -m "Add new feature"
   ```
4. Push to your forked branch:

   ```bash
   git push origin feature-name
   ```
5. Open a Pull Request

---

## 📃 License

This project is licensed under the **MIT License**.
Feel free to use and customize it for personal or commercial projects.

---

