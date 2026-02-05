# MatchMach - Visual Algorithm Engine

MatchMach is a premium, interactive web application designed to visualize and teach core string matching algorithms. Built with a focus on aesthetics and user experience, it provides deep insights into how algorithms like Naive Search, KMP, and Rabin-Karp process text and find patterns.

![Project Preview](https://via.placeholder.com/1200x600/020617/8b5cf6?text=MatchMach+Visualization+Engine)

## 🚀 Features

*   **Algorithm Visualization**: Real-time, step-by-step visualization of string matching.
    *   **Naive String Matching**: Classic window-sliding approach.
    *   **Knuth-Morris-Pratt (KMP)**: Visualization of the LPS (Longest Prefix Suffix) table and intelligent shifting.
    *   **Rabin-Karp**: Rolling hash calculation and window comparison visualization.
*   **Detailed Metrics**: Live tracking of current steps, comparisons, and algorithmic states (match, mismatch, shift).
*   **Step-by-Step Navigation**: 
    *   Play/Pause simulation.
    *   Manual **Previous** and **Next** step controls for detailed analysis.
    *   Speed control slider.
*   **Algorithm Theory**: A dedicated section explaining the time complexity (Space/Time), mechanics, pros, and cons of each algorithm.
*   **Modern UI/UX**:
    *   Deep Slate Dark Theme (`#020617`).
    *   Smooth Framer Motion animations.
    *   Responsive, scrollbar-free layout for a native app feel.

## 🛠️ Technology Stack

*   **Frontend**: React.js (Vite), Tailwind CSS, Framer Motion, Lucide React.
*   **Backend**: Node.js, Express (API structure ready).
*   **Tooling**: Concurrently (to run client and server together).

## 📋 Prerequisites

*   [Node.js](https://nodejs.org/) (v16 or higher recommended)
*   npm or yarn

## ⚙️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Satvik-Parihar/MatchMach.git
    cd MatchMach
    ```

2.  **Install Dependencies**
    
    This project uses a simple developer script to run both client and server. You need to install dependencies in the root, client, and server folders.

    **Root:**
    ```bash
    npm install
    ```

    **Client:**
    ```bash
    cd client
    npm install
    cd ..
    ```

    **Server:**
    ```bash
    cd server
    npm install
    cd ..
    ```

## 🏃‍♂️ Running the Application

To start the application, simply run the development script from the **root** directory. This will start both the backend server (port 5000) and the frontend client (port 5173).

```bash
node dev.js
// OR
npm start
```

Open your browser and navigate to:  
`http://localhost:5173`

## 📂 Project Structure

```
MatchMach/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── algorithms/     # Generator functions for visualizations
│   │   ├── data/           # Static data for Theory pages
│   │   ├── App.jsx         # Main application logic
│   │   └── index.css       # Global styles & Tailwind imports
│   └── tailwind.config.js  # Tailwind configuration
├── server/                 # Node.js Backend
│   ├── algorithms.js       # Backend algorithm implementations
│   └── index.js            # Express server entry point
├── dev.js                  # Script to run server/client concurrently
└── package.json            # Root dependencies
```

## 👤 Author

**Satvik Parihar**  
*   GitHub: [@Satvik-Parihar](https://github.com/Satvik-Parihar)
*   Email: harishparihar663@gmail.com

---
*Developed for Design and Analysis of Algorithms (DAA) - Semester 5*
