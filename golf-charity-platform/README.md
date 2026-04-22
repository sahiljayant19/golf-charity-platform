# Golf Charity Platform

A golf charity platform built with Next.js, Supabase, and Stripe.

A subscription-driven web application combining golf performance tracking, charity fundraising, and monthly draw-based prize rewards.

## Features

- **Subscription System**: Monthly and yearly plans with Stripe integration
- **Score Tracking**: Stableford format score entry with 5-score rolling logic
- **Draw Engine**: Random and algorithmic monthly draws with prize pool distribution
- **Charity Integration**: Support for multiple charities with configurable contribution percentages
- **Winner Verification**: Proof upload and admin approval workflow
- **User Dashboard**: Comprehensive dashboard with subscription status, scores, and winnings
- **Admin Dashboard**: Full control over users, draws, charities, and winner verification
- **Modern UI/UX**: Emotion-driven design with animations and mobile-first responsive layout

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd golf-charity-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy the `environment.example` file to `.env.local`:

```bash
cp environment.example .env.local
```

Fill in the required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_APP_URL=your_app_url
```

### 4. Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql` in the Supabase SQL editor
3. Enable Row Level Security (RLS) policies as defined in the schema
4. Create an admin user by setting their role to 'admin' in the profiles table

### 5. Stripe Setup

1. Create Stripe products and prices for monthly and yearly subscriptions
2. Set up webhook endpoints for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
3. Configure the webhook URL: `https://your-domain.com/api/webhooks/stripe`
4. Update environment variables with your Stripe keys and webhook secret

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses the following main tables:

- `profiles` - User profiles and roles
- `charities` - Charity information
- `subscriptions` - User subscription details
- `scores` - Golf scores (5-score rolling window)
- `draws` - Monthly draw configurations
- `draw_entries` - User entries for draws
- `winners` - Winner verification and payout tracking
- `charity_events` - Charity-related events
- `donations` - Independent donations

See `supabase/schema.sql` for complete schema definition.

## API Routes

### Authentication
- `POST /api/auth/*` - Authentication handlers

### Subscriptions
- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Stripe webhook handler

### Scores
- `GET /api/scores?userId={id}` - Get user scores
- `POST /api/scores` - Add score
- `PUT /api/scores` - Update score
- `DELETE /api/scores?scoreId={id}` - Delete score

### Draws
- `GET /api/draws` - List draws
- `POST /api/draws` - Create draw
- `POST /api/draws/{id}/publish` - Publish draw results
- `POST /api/draw-entries` - Create draw entry

### Charities
- `GET /api/charities` - List charities
- `POST /api/charities` - Add charity (admin)
- `PUT /api/charities` - Update charity (admin)
- `DELETE /api/charities?id={id}` - Delete charity (admin)

### Winners
- `GET /api/winners` - List winners
- `POST /api/winners` - Upload proof
- `POST /api/winners/{id}/verify` - Verify winner (admin)

### Admin
- `GET /api/admin/users` - List all users (admin)

## Deployment

### Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Required Environment Variables for Production

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

## Admin Setup

After deployment, create an admin user:

1. Sign up as a regular user
2. Access the Supabase dashboard
3. Navigate to the `profiles` table
4. Update the user's `role` field to `admin`
5. The user will now have access to `/admin`

## Testing Checklist

- [ ] User signup and login
- [ ] Subscription flow (monthly and yearly)
- [ ] Score entry (5-score rolling logic)
- [ ] Draw system logic and simulation
- [ ] Charity selection and contribution calculation
- [ ] Winner verification flow
- [ ] User dashboard (all modules functional)
- [ ] Admin panel (full control and usability)
- [ ] Data accuracy across all modules
- [ ] Responsive design on mobile and desktop
- [ ] Error handling and edge cases

## Project Structure

```
golf-charity-platform/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # User dashboard
│   │   ├── admin/        # Admin dashboard
│   │   ├── login/        # Login page
│   │   ├── signup/       # Signup page
│   │   ├── charities/    # Charities directory
│   │   └── page.tsx      # Homepage
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts
│   ├── lib/             # Utility libraries
│   │   ├── supabase/    # Supabase client
│   │   ├── stripe/      # Stripe config
│   │   └── draw/        # Draw engine logic
│   └── types/           # TypeScript types
├── supabase/
│   └── schema.sql       # Database schema
└── environment.example  # Environment variables template
```

## Support

For issues or questions, please refer to the project documentation or contact the development team.

## License

This project is part of the Digital Heroes training program evaluation.
