# Saurav Fee Management System

A comprehensive, web-based Fee Management System designed for educational institutes to streamline student admissions, fee collection, expense tracking, and financial reporting. Built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Preview)

## 🚀 Features

*   **Student Management:**
    *   New Student Admission with detailed profiles.
    *   Course and Batch assignment.
    *   Student Search and Filtering.
    *   Profile Management (Edit/Delete).
*   **Fee Collection:**
    *   Easy Fee Collection interface.
    *   Partial Payment support.
    *   **Instant Receipt Generation** (Printable).
    *   Payment History tracking.
*   **Financial Management:**
    *   **Expense Tracking:** Record and categorize institute expenses (Rent, Salary, etc.).
    *   **Dashboard Analytics:** Real-time overview of Today's Collection, Pending Fees, and Net Balance.
*   **Reports & Exports:**
    *   **Defaulters List:** Identify students with pending fees.
    *   **Batch-wise Reports:** Filter students by batch.
    *   **Collection Reports:** Detailed transaction logs.
    *   **Excel Export:** Download reports for offline analysis.
*   **System & Security:**
    *   **Role-Based Access:** Admin (Full Access) and Staff (Limited Access) roles.
    *   **Data Backup & Restore:** Manual JSON backup and restore functionality.
    *   **Secure Authentication:** JWT-based login system.

## 🛠️ Tech Stack

*   **Frontend:** React (Vite), TypeScript, Tailwind CSS, Shadcn UI, Recharts, Axios.
*   **Backend:** Node.js, Express.js, TypeScript.
*   **Database:** MongoDB (Mongoose).
*   **Tools:** React-to-Print (Receipts), XLSX (Excel Export), Zod (Validation).

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/Rohan-Unbeg/saurav-fee-management.git
cd saurav-fee-management
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Update .env with your MongoDB URI and Secrets
```

**Start Backend:**
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

**Start Frontend:**
```bash
npm run dev
```

## 🔑 Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fee_management
JWT_SECRET=your_super_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
