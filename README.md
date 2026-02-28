# Mwananchi - Offline-First Point of Sale System

A modern, offline-capable Point of Sale system designed specifically for Kenyan market traders. Built with Next.js, TypeScript, Supabase, and IndexedDB for a seamless offline-first experience.

## Features

### ✅ Completed Features

1. **User Authentication & Authorization**
   - User registration and login with email/password
   - Role-based access control (Admin, Cashier)
   - Session management with JWT tokens
   - Secure password hashing

2. **Product Management**
   - Add, edit, and delete products
   - SKU tracking and inventory management
   - Cost price and selling price tracking
   - Profit margin calculations
   - Reorder level alerts

3. **Point of Sale Interface**
   - Product search and quick add to cart
   - Real-time cart with quantity adjustments
   - Support for item-level discounts
   - Automatic tax calculation (16% VAT)
   - Order summary with change calculation

4. **Payment Processing**
   - Cash payments with change calculation
   - M-Pesa mobile money integration ready
   - Transaction history tracking
   - Payment receipts

5. **Offline-First Architecture**
   - IndexedDB for local data storage
   - Service Worker for offline functionality
   - Automatic sync when connection restored
   - Sync queue for failed transactions

6. **Dashboard & Reporting**
   - Store overview with key metrics
   - Transaction history
   - Inventory status monitoring
   - Quick action shortcuts

## Tech Stack

- **Frontend**: Next.js 16 with TypeScript and Tailwind CSS
- **Backend**: Supabase PostgreSQL with Row Level Security
- **Offline Storage**: IndexedDB + Service Worker
- **Authentication**: JWT-based with secure session management
- **UI Components**: Custom React components with Lucide icons

## Project Structure

```
/app
  /api
    /auth              # Authentication endpoints
    /products          # Product management endpoints
    /transactions      # Payment & transaction endpoints
  /auth
    /login            # Login page
    /register         # Registration page
  /dashboard
    /products         # Product management page
    /pos              # Point of Sale interface
    /customers        # Customer management (stub)
    /settings         # Store settings page

/components
  /dashboard
    /header           # Dashboard header with sync status
    /sidebar          # Navigation sidebar
  /pos
    /product-selector # Product search and selection
    /cart             # Shopping cart display
    /checkout-panel   # Payment checkout interface
  /products
    /product-form    # Product creation/editing form
    /product-list    # Products table view

/lib
  /auth-context.tsx  # Authentication context provider
  /auth-service.ts   # Authentication service
  /cart-store.ts     # Cart state management
  /indexeddb.ts      # IndexedDB database operations
  /offline-sync.ts   # Offline synchronization service
  /supabase.ts       # Supabase client initialization
  /transactions-service.ts  # Transaction operations
  /types.ts          # TypeScript type definitions
  /utils.ts          # Utility functions

/hooks
  /use-auth.ts       # Authentication hook
  /use-cart.ts       # Cart state hook
  /use-offline.ts    # Offline status hook
  /use-products.ts   # Products management hook

/public
  /sw.js             # Service Worker for offline support

/scripts
  /01-schema.sql     # Database schema creation
  /02-indexes.sql    # Database indexes
  /03-triggers.sql   # Database triggers
  /04-rls.sql        # Row Level Security policies
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account with a PostgreSQL project
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aestheticrayn7-cloud/mwananchi.git
   cd mwananchi
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Initialize the database**

   Copy the contents of the SQL migration files and run them in your Supabase SQL Editor:
   - `/scripts/01-schema.sql` - Creates all tables
   - `/scripts/02-indexes.sql` - Creates indexes for performance
   - `/scripts/03-triggers.sql` - Sets up automatic timestamp updates
   - `/scripts/04-rls.sql` - Configures Row Level Security

   Or use the API endpoint to initialize:
   ```bash
   curl -X POST http://localhost:3000/api/admin/init-db
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating an Account

1. Visit the registration page at `/auth/register`
2. Enter your details and store name
3. You'll be logged in automatically and redirected to the dashboard

### Adding Products

1. Go to **Products** in the sidebar
2. Click **Add Product**
3. Fill in product details (name, SKU, price, cost)
4. Save the product

### Processing a Sale

1. Click **Point of Sale** in the sidebar
2. Search for products or browse the product grid
3. Click products or the + button to add to cart
4. Adjust quantities as needed
5. Click **Proceed to Checkout**
6. Select payment method (Cash or M-Pesa)
7. Enter amount received
8. Complete the sale

### Viewing Reports

- **Dashboard**: See overview of products, low stock items, and total inventory value
- **Settings**: Access store information and system settings

## Offline Capabilities

The application is designed to work seamlessly offline:

1. **Product data** is cached in IndexedDB when products are viewed
2. **Transactions** are queued locally if the connection drops during checkout
3. **Service Worker** caches assets for offline access
4. **Automatic Sync**: When reconnected, pending transactions sync automatically
5. **Sync Status**: The header shows online/offline status and pending sync count

## Database Schema

### Core Tables

- **stores**: Store information and ownership
- **users**: User accounts with roles and authentication
- **products**: Product catalog with pricing and inventory
- **categories**: Product categorization
- **customers**: Customer profiles and credit tracking
- **transactions**: Sales records with timestamp
- **transaction_items**: Individual items in transactions
- **payments**: Payment records for transactions
- **sync_queue**: Queue for offline sync operations

All tables include Row Level Security policies to ensure users only access their store's data.

## Security Features

1. **Row Level Security (RLS)**: All data is isolated by store
2. **JWT Authentication**: Secure token-based authentication
3. **Password Hashing**: Bcrypt-compatible hashing
4. **Parameterized Queries**: Prevention of SQL injection
5. **CORS**: API endpoints validate origins
6. **Session Management**: Secure localStorage for tokens

## Future Enhancements

- [ ] Customer credit/debt management
- [ ] Advanced reporting and analytics
- [ ] Multiple user roles and permissions
- [ ] Barcode scanning support
- [ ] Receipt printing
- [ ] Inventory adjustment tools
- [ ] Multi-store support
- [ ] Mobile app (React Native)
- [ ] Advanced M-Pesa integration
- [ ] Data backup and export

## Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or feedback:

- Open an issue on GitHub
- Email: support@mwananchi.com
- Documentation: Check the SETUP.md file for detailed setup instructions

## Acknowledgments

- Built for Kenyan market traders by Vercel v0
- Inspired by modern e-commerce POS systems
- Powered by Supabase, Next.js, and the broader React ecosystem

---

**Made with ❤️ for African traders**
