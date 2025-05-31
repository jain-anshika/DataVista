# 📊 DataVista – Smart Data Analysis Dashboard

**DataVista** is an intuitive and interactive data analysis dashboard that allows users to upload datasets (CSV or JSON), explore data insights, and uncover hidden trends with ease. Designed for data enthusiasts, analysts, and developers, DataVista simplifies exploratory data analysis (EDA) by offering a no-code interface to visualize and interpret datasets in seconds.

---

## 🚀 Features

* 📁 **Upload Files**: Upload CSV or JSON datasets via a simple UI.
* 📈 **Data Overview**:

  * View total records (rows)
  * View total columns
  * See missing/null values per column
* 🔍 **Smart Insights**:

  * Identify key trends in data
  * Detect missing values and data types
  * Summary statistics for numerical and categorical fields
* 📊 **Visualization**:

  * Generate basic charts (bar, pie, line)
  * Visualize null values and distributions
* 🤖 **Predictive Suggestions**:

  * Get smart column-level predictions and potential insights using AI models
* 🧹 **Data Cleaning Preview** *(coming soon)*:

  * Identify duplicate or anomalous entries
  * Suggestions to clean or transform data
* 🔒 **Authentication**:

  * Secure file uploads for individual users

---

## 🧰 Tech Stack

| Frontend         | Backend           | Data Processing           | Auth & Hosting       |
| ---------------- | ----------------- | ------------------------- | -------------------- |
| React / Next.js  | Node.js / Express | Python (Pandas, NumPy)    | Firebase / JWT       |
| Tailwind CSS     | RESTful APIs      | Matplotlib / Seaborn      | Vercel / Render      |
| Chart.js / D3.js | File Handling     | Scikit-learn              | MongoDB              |

---

## 📦 Installation & Usage

### 1. Clone the Repo

```bash
git clone https://github.com/jain-anshika/datavista.git
cd datavista
```

### 2. Install Dependencies

```bash
# For frontend (Next.js)
cd frontend
npm install

# For backend
cd ../backend
npm install
```

### 3. Run the App

```bash
# Start backend
cd backend
npm start

# Start frontend (in a new terminal)
cd ../frontend
npm run dev
```

> App runs locally at: `http://localhost:3000`

---

## ⚙️ Core Functionalities

| Function               | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| File Upload            | Upload CSV or JSON for analysis                                |
| Data Summary           | Show rows, columns, types, and null counts                     |
| Visualization          | Graphs and charts to understand distribution & trends          |
| Missing Value Analysis | Highlight and count missing/null values                        |
| Predictive Insights    | (Optional) Use ML to predict missing values or detect patterns |


## 🧑‍💻 Contributing

We welcome contributions! To contribute:

1. Fork the repo
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

---

## 📃 License

This project is licensed under the MIT License.
Feel free to use and customize it for personal or commercial projects.

---

