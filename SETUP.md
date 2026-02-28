## Mwananchi POS System - Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Supabase account and project
- Environment variables configured

### Installation Steps

#### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

#### 2. Set Up Supabase Database

The database schema is split into multiple SQL files in the `/scripts` directory:
- `01-schema.sql` - Creates all tables
- `02-indexes.sql` - Creates performance indexes
- `03-triggers.sql` - Creates automatic timestamp triggers
- `04-rls.sql` - Enables Row Level Security

**To apply these migrations:**

Option A: Use Supabase Web Dashboard
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `scripts/01-schema.sql`
5. Click "Run"
6. Repeat for `02-indexes.sql`, `03-triggers.sql`, and `04-rls.sql`

Option B: Use Supabase CLI
```bash
supabase db push --local
# or if you have supabase-cli installed
supabase migration new init_schema
# Copy the SQL files contents into the migration file
supabase db push
```

#### 3. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under "API".

#### 4. Create Initial Admin User

After the database is set up:

1. Sign up a new user in your app
2. Go to Supabase Dashboard → Authentication → Users
3. Copy the user's UUID
4. Go to SQL Editor and run:

```sql
INSERT INTO stores (name, owner_id, location, email, phone, currency_code, timezone)
VALUES ('Your Store Name', 'USER_UUID_HERE', 'Nairobi', 'email@example.com', '+254...', 'KES', 'Africa/Nairobi');

INSERT INTO users (id, email, full_name, role, store_id, is_active)
VALUES ('USER_UUID_HERE', 'email@example.com', 'Your Name', 'admin', 'STORE_UUID_HERE', true);
```

#### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Offline-First Setup

The app uses:
- **IndexedDB** for local storage of products, transactions, and customers
- **Service Worker** for sync management and offline detection
- **Supabase** for backend synchronization when online

All data syncs automatically when connection is detected.

### Key Features

✅ **Product Management** - Add, edit, organize products by category
✅ **Point of Sale** - Fast checkout interface optimized for touch
✅ **Offline POS** - Process sales even without internet
✅ **Payment Methods** - Cash, M-Pesa, and customer credit
✅ **Customer Management** - Track customer info and credit usage
✅ **Transaction History** - Full sales reporting and analytics
✅ **User Roles** - Admin, Manager, and Cashier access levels
✅ **Automatic Sync** - Background synchronization when online

### Project Structure

```
mwananchi/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Redirect to /login
│   ├── (auth)/
│   │   ├── login/              # Login page
│   │   └── signup/             # Signup page
│   ├── (app)/
│   │   ├── pos/                # Point of Sale interface
│   │   ├── products/           # Product management
│   │   ├── customers/          # Customer management
│   │   ├── transactions/       # Transaction history
│   │   └── dashboard/          # Reporting & analytics
│   └── api/
│       ├── auth/               # Authentication endpoints
│       ├── products/           # Product CRUD
│       ├── transactions/       # Transaction endpoints
│       └── sync/               # Offline sync endpoints
├── components/
│   ├── auth/                   # Auth components
│   ├── pos/                    # POS components
│   ├── products/               # Product components
│   ├── customers/              # Customer components
│   ├── shared/                 # Shared UI components
│   └── ui/                     # Shadcn UI components
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── types.ts               # TypeScript types
│   ├── utils.ts               # Utility functions
│   ├── store.ts               # State management
│   └── db/
│       ├── indexeddb.ts       # IndexedDB helpers
│       └── sync.ts            # Sync logic
├── hooks/
│   ├── useAuth.ts             # Authentication hook
│   ├── useStore.ts            # Store context hook
│   ├── useIndexedDB.ts        # IndexedDB hook
│   └── useSync.ts             # Sync status hook
├── public/
│   └── sw.js                  # Service Worker
└── scripts/
    ├── 01-schema.sql          # Database schema
    ├── 02-indexes.sql         # Performance indexes
    ├── 03-triggers.sql        # Auto timestamp updates
    └── 04-rls.sql             # Row Level Security
```

### Troubleshooting

**Q: "Database not found" error**
A: Make sure you've run all 4 SQL migration scripts in order (01, 02, 03, 04).

**Q: "auth.uid() returns null"**
A: Make sure you're logged in and the RLS policies are correctly applied.

**Q: Offline sync not working**
A: Check browser console for Service Worker errors. Make sure you're testing on HTTPS or localhost.

**Q: Products not showing in POS**
A: Make sure products are created with the correct store_id matching the current user's store.

### Support

For issues, check:
1. Supabase project logs (Logs → Edge Function Logs)
2. Browser console (F12)
3. Network tab to verify API calls
