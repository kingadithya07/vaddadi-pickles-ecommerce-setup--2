# Vaddadi Pickles E-Commerce

A modern, responsive e-commerce web application for selling authentic homemade pickles and culinary products. Built with performance, clean architecture, and user experience in mind, this project provides a full-featured storefront including product variants, shopping cart functionality, affiliate tracking, and integrated admin management.

## 🚀 Tech Stack

This project is built using modern web development technologies:

*   **Frontend Framework:** [React 19](https://react.dev/)
*   **Build Tool & Dev Server:** [Vite 7](https://vitejs.dev/)
*   **Language:** [TypeScript 5](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
*   **State Management:** [Zustand 5](https://zustand-demo.pmnd.rs/)
*   **Routing:** [React Router 7](https://reactrouter.com/)
*   **Backend / Database:** [Supabase](https://supabase.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Analytics & Visuals:** [Recharts](https://recharts.org/)
*   **PWA:** [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)

---

## 📁 Project Architecture & Directory Structure

The codebase is organized into domain-driven modular directories with centralized barrel exports and `@/*` path aliasing:

```
vaddadi-pickles-ecommerce-setup--2/
├── public/                          # Static assets, web app manifest, icons, robots.txt, sitemap.xml
├── scripts/                         # Maintenance, test, and codemod scripts
│   ├── patches/                     # Migration scripts and refactoring codemods
│   ├── tests/                       # Diagnostics and integration test scripts (auth, schema, telegram)
│   └── README.md                    # Detailed documentation for scripts
│
├── src/
│   ├── components/                  # Reusable UI & business components
│   │   ├── admin/                   # Admin panel specific components (e.g., AdminAffiliates)
│   │   ├── common/                  # Global widgets & guards (ErrorBoundary, ProtectedRoute, WhatsAppButton, PWA)
│   │   ├── layout/                  # Structural layout components (Header, Footer)
│   │   ├── modals/                  # Modals (ProductDetails, ComboDetails, Share, Reviews)
│   │   ├── product/                 # Product cards and storefront catalog elements
│   │   └── index.ts                 # Unified barrel export for all components
│   │
│   ├── pages/                       # Application route pages
│   │   ├── admin/                   # Admin dashboard & affiliate portal (Admin, AffiliateDashboard)
│   │   ├── auth/                    # Authentication flows (Login, ForgotPassword, ResetPassword, AuthSuccess)
│   │   ├── legal/                   # Policy & informational pages (AboutUs, FAQ, Privacy, Refund, Terms)
│   │   ├── shop/                    # Storefront pages (Home, Products, Cart, Checkout, Orders, Profile, Wishlist)
│   │   └── index.ts                 # Unified barrel export for all pages
│   │
│   ├── data/                        # Static datasets (states & cities geographic data)
│   ├── hooks/                       # Custom React hooks (e.g., useCartTotals)
│   ├── lib/                         # External client SDKs (Supabase client, Telegram notifications)
│   ├── store/                       # Zustand store with persistent client state & cache
│   ├── types/                       # Shared TypeScript interfaces and data models
│   ├── utils/                       # Utility functions (pincode lookup, phone format, tracking, address formatting)
│   ├── App.tsx                      # Root route configuration & app shell layout
│   ├── index.css                    # Global Tailwind CSS styles
│   └── main.tsx                     # React application bootstrapping & Service Worker registration
│
├── tsconfig.json                    # TypeScript configuration with @/* path mappings
├── vite.config.ts                   # Vite configuration with PWA & alias settings
└── package.json                     # Project scripts and dependencies
```

### 🔗 Path Aliases (`@/*`)

TypeScript and Vite are configured to support the `@/*` alias pointing directly to `src/*`:

```typescript
import { useStore } from '@/store';
import { ProductCard, Header, Footer } from '@/components';
import { formatPhoneNumber } from '@/utils';
import { supabase } from '@/lib';
```

---

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
* **Open Graph Support:** Rich link previews when sharing the website on WhatsApp, Facebook, or Twitter.

---

## 🛠️ Getting Started

Follow these steps to run the application locally on your machine.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18 or higher recommended) installed.

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
    Create a `.env` file in the root directory based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
    *Add your specific `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`.*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open in Browser:**
    Navigate to `http://localhost:5173` (or the port Vite provides).

---

## 📦 Build for Production

To create a production build:

```bash
npm run build
```

This compiles and minifies the application into the `dist/` directory and outputs service worker bundles. To test the production build locally:

```bash
npm run preview
```

---

## 🔒 Security Note

Never commit `.env` files containing live secrets to version control. Always maintain the `.env.example` template for development setup.
