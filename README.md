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

### 🛍️ Storefront & User Experience
* **Responsive Design:** Fully mobile-optimized, beautiful interface utilizing Tailwind CSS.
* **Product Catalog & Combos:** Browse single products or bundled combos with dynamic pricing, best-seller badges, and ratings.
* **Dynamic Weight Variants:** Granular support for size/weight variants (e.g., 250g, 500g, 1kg) with real-time price updates.
* **Wishlist System:** Users can save favorite products for later viewing and easy purchasing.
* **Advanced Shopping Cart:** Persistent cart state, dynamic total calculation, and seamless item updates via Zustand.
* **Zero-Fee Payments:** Manual UPI payment flow with custom QR codes and transaction ID verification.
* **WhatsApp Integration:** Floating chat widget and dynamic, E.164-compliant WhatsApp links for support and order sharing.

### 🔐 Accounts & Profiles
* **User Authentication:** Secure email/password login and registration powered by Supabase.
* **Profile Management:** Customers can save multiple delivery addresses, track live order history, and manage personal details.
* **Auto-Affiliate Enrollment:** Customers are instantly converted into affiliates upon registration, generating a unique referral code to earn lifelong commissions (e.g., 10%) on driven sales.

### ⚙️ Admin & Store Management
* **Secure Admin Panel:** Comprehensive dashboard to manage orders, update product inventory, and track business revenue.
* **Visual Analytics:** Interactive charts powered by Recharts detailing sales trends (last 30 days) and top-selling products.
* **Advanced Inventory Handling:** Smart "Out of Stock" overlays, zero-stock variant disabling, and cart quantity caps tied directly to available stock.
* **Abandoned Cart Recovery:** Real-time tracking of incomplete orders in the admin panel with one-click WhatsApp reminder links to follow up with customers.
* **Real-time Telegram Notifications:** Instant bot alerts pushed to the admin's mobile device the second a customer places a new order.
* **Coupon & Discount Engine:** Create and manage promotional codes for percentage or flat-rate discounts.
* **Pincode Validation:** Restrict orders and validate deliveries based on supported local geographic pincodes.
* **Customer Feedback:** Capture and manage site feedback and reviews directly from the storefront.

### 🚀 Performance, SEO & Mobile
* **Progressive Web App (PWA):** Fully installable mobile and desktop app experience generated via `vite-plugin-pwa`.
* **Search Engine Optimization (SEO):** Dynamic page titles and meta descriptions using `react-helmet-async`, `robots.txt`, and standard `sitemap.xml`.
* **Clean Routing:** Configured with `BrowserRouter` for crawler-friendly URLs (no hash fragments).
* **Open Graph Support:** Beautiful rich link previews when sharing the website on WhatsApp, Facebook, or Twitter.

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
