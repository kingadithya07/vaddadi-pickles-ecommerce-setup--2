# Vaddadi Pickles E-Commerce

A modern, responsive e-commerce web application for selling authentic pickles and related products. Built with performance and user experience in mind, this project provides a full-featured storefront including product variants, shopping cart functionality, and integrated state management.

## 🚀 Tech Stack

This project is built using modern web development technologies:

*   **Frontend Framework:** [React 19](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
*   **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
*   **Routing:** [React Router](https://reactrouter.com/)
*   **Backend/Database (BaaS):** [Supabase](https://supabase.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)

## ✨ Key Features

*   **Product Catalog:** Browse a variety of products with support for best-seller badges, ratings, and detailed descriptions.
*   **Dynamic Weight Variants:** Products support multiple size/weight variants (e.g., 250g, 500g, 1kg) with dynamic pricing.
*   **Advanced Inventory Handling:** Smart "Out of Stock" UI overlay, disabling of specific zero-stock variants, and cart quantity caps based on available stock.
*   **Shopping Cart:** Persistent cart state using Zustand to handle adding, removing, and updating item quantities seamlessly.
*   **Responsive Design:** Fully mobile-optimized layout leveraging Tailwind CSS utility classes.
*   **Product Reviews:** Integrated modal to view customer reviews and ratings.

## 🛠️ Getting Started

Follow these steps to run the application locally on your machine.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/vaddadi-pickles-ecommerce-setup--2.git
    cd vaddadi-pickles-ecommerce-setup--2
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory based on the provided `.env.example` file and fill in your Supabase credentials:
    ```bash
    cp .env.example .env
    ```
    *Add your specific `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the `.env` file.*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open in Browser:**
    Navigate to `http://localhost:5173` (or the port Vite provides) in your web browser.

## 📦 Build for Production

To create a production-ready build:

```bash
npm run build
```
This will compile the application into the `dist` folder, optimizing assets and minifying the code for optimal performance. You can preview the production build locally using `npm run preview`.

## 🔒 Security Note

Please ensure you do not commit your `.env` file containing actual production secrets to version control. Use the `.env.example` file to denote required environment variables.

---
*vp 369*
