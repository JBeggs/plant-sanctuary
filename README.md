# Plant Sanctuary

E-commerce site for plants and plant care. Built with Next.js, connects to Django CRM backend.

## Features

- Product catalog (plants)
- Shopping cart and checkout with Yoco payments
- Care guides (articles)
- User authentication
- Admin inventory management
- Nature/green theme

## Tech Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS
- Django CRM API (shared backend)
- Yoco payments

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` from template:**
   ```bash
   cp env-template.txt .env.local
   ```

3. **Configure environment:**
   ```
   NEXT_PUBLIC_API_URL=https://3pillars.pythonanywhere.com/api
   NEXT_PUBLIC_COMPANY_SLUG=plant-sanctuary
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3002](http://localhost:3002)

## Backend Setup

Before running, ensure the Plant Sanctuary company is registered in Django CRM:

1. Create `EcommerceCompany` with slug `plant-sanctuary` and name `Plant Sanctuary`
2. Add products via admin or API
3. Configure Yoco for payments (company-scoped)

## Scripts

- `npm run dev` - Start dev server (port 3002)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
