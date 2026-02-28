# Mwananchi POS - Quick Start Guide

Get up and running with the Mwananchi Point of Sale system in 5 minutes.

## Prerequisites

- Node.js 18 or higher
- A Supabase account (free tier works)
- Git

## 1. Clone & Install

```bash
git clone https://github.com/aestheticrayn7-cloud/mwananchi.git
cd mwananchi
npm install
```

## 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `Anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Go to **Settings → Database** and copy:
   - Service Role Secret → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Create Environment File

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
JWT_SECRET=dev-secret-change-in-production
```

## 4. Initialize Database

### Option A: Using Supabase Dashboard (Recommended)

1. Go to SQL Editor in Supabase
2. Create a new query
3. Copy and paste contents of `/scripts/01-schema.sql`
4. Click **Run**
5. Repeat for `/scripts/02-indexes.sql`, `/scripts/03-triggers.sql`, `/scripts/04-rls.sql`

### Option B: Using API Endpoint

```bash
npm run dev
curl -X POST http://localhost:3000/api/admin/init-db
```

## 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 6. Create Your First Account

1. Click **Sign Up**
2. Enter your details:
   - Full Name: `John Doe`
   - Store Name: `My Market Store`
   - Email: `john@example.com`
   - Password: `Password123`
3. Click **Sign Up**

You're now logged in!

## 7. Add Your First Product

1. Click **Products** in the sidebar
2. Click **Add Product**
3. Fill in:
   - Product Name: `Tomatoes`
   - SKU: `TOM001`
   - Selling Price: `50`
   - Cost Price: `30`
4. Click **Save Product**

## 8. Create Your First Sale

1. Click **Point of Sale** in the sidebar
2. Click on **Tomatoes** to add to cart
3. Adjust quantity if needed
4. Click **Proceed to Checkout**
5. Select **Cash** as payment method
6. Enter amount received: `100`
7. Click **Complete Sale**

🎉 Your first sale is complete!

## Common Issues

### "Database not initialized" error
- Make sure you ran the SQL migration scripts
- Check your Supabase credentials in `.env.local`

### "Unauthorized" error
- Clear localStorage: `localStorage.clear()` in browser console
- Log out and log back in

### Products not showing
- Check internet connection
- Wait for service worker to cache data
- Try refreshing the page

### Offline not working
- Ensure HTTPS (service workers require HTTPS in production)
- Check browser supports Service Workers
- Try opening DevTools → Application → Service Workers

## Project Structure

```
mwananchi/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Auth pages
│   └── dashboard/        # Main app pages
├── components/           # React components
├── lib/                  # Services & utilities
├── hooks/                # Custom React hooks
├── public/               # Static files
├── scripts/              # Database migrations
└── README.md             # Full documentation
```

## What's Included

✅ User authentication (login/register)
✅ Product management
✅ Point of Sale interface
✅ Shopping cart with calculations
✅ Payment processing
✅ Transaction history
✅ Offline support
✅ Dashboard with metrics
✅ Responsive design

## Next Steps

1. **Read Full Documentation**: Check `README.md`
2. **Explore Features**: Test all POS features
3. **Customize**: Update branding and settings
4. **Deploy**: Push to Vercel or your server
5. **Extend**: Add more features as needed

## Customization

### Change Store Name
- Go to **Settings** page
- Store name is set at registration (changeable in database)

### Change Colors
- Edit `lib/utils.ts` for colors
- Edit `tailwind.config.ts` for theme
- Edit `app/globals.css` for global styles

### Change Currency
- Search for `KES` in codebase
- Replace with your currency code
- Update formatCurrency function in `lib/utils.ts`

## Deployment

### Deploy to Vercel (Easiest)

```bash
npm install -g vercel
vercel
```

Follow the prompts and set environment variables in the Vercel dashboard.

### Deploy to Other Platforms

1. Build: `npm run build`
2. Set environment variables on your platform
3. Start: `npm run start`

## Support

- 📖 See `README.md` for full documentation
- 📋 See `IMPLEMENTATION_SUMMARY.md` for technical details
- 🐛 Report issues on GitHub
- 💬 Check code comments for implementation details

## Tips & Tricks

### Bulk Product Import
- Save products as CSV, import via admin panel (future feature)

### Offline Testing
- DevTools → Network → Offline to test offline mode

### Clear All Data
- Supabase Dashboard → SQL Editor → `DELETE FROM transactions; DELETE FROM products;`

### Test Data
- Register multiple users to test different accounts
- Products are isolated by store

---

**You're all set!** Start processing sales with Mwananchi POS.

Happy trading! 🚀
