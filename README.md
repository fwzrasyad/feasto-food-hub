# 🍔 USM Feasto - Campus Food Delivery App

Feasto is a modern, full-stack web application designed to streamline food ordering within Universiti Sains Malaysia (USM). It connects students (customers) with campus cafeteria vendors through a seamless digital interface.


## 🚀 Key Features

### 👤 For Customers (Students)
* **Browse & Search:** Filter food by category (Rice, Noodles, etc.) or search by name.
* **Vendor Selection:** View menus specific to different hostel cafeterias.
* **Shopping Cart:** Add items, adjust quantities, and review total cost.
* **Secure Checkout:** Simulated order placement with history tracking.

### 🏪 For Vendors
* **Dashboard:** dedicated portal to manage business operations.
* **Menu Management:** Add, edit, and delete food items in real-time.
* **Image Upload:** Upload food photos directly to cloud storage.
* **Security:** Vendors can only modify *their own* data (Row Level Security).

### 🛡️ Security & Architecture
* **Authentication:** Secure Email/Password login via Supabase Auth.
* **Session Management:** Auto-timeout and secure token handling.
* **Data Protection:** SQL Injection protection and Row Level Security (RLS) policies.
* **Hosting:** Fully deployed on Vercel with automatic HTTPS.

## 🛠️ Tech Stack

* **Frontend:** React (Vite), TypeScript, Tailwind CSS
* **UI Library:** Shadcn UI, Lucide Icons
* **Backend:** Supabase (PostgreSQL)
* **Auth:** Supabase Auth (JWT)
* **Storage:** Supabase Storage (Image Buckets)
* **Deployment:** Vercel

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/usm-feasto-app.git](https://github.com/YOUR_USERNAME/usm-feasto-app.git)
    cd usm-feasto-app
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory. Copy the keys from your Supabase project settings:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    
## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---
