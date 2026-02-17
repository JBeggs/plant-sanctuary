# Plant Sanctuary – Testing Guide

Next.js 16 e-commerce and articles site. Consumes Django API. Runs on port 3002.

---

## Quick Start

### Prerequisites

- Node.js 18+
- Django backend running at `http://localhost:8000`

### Run the App Locally

```bash
cd plant-sanctuary
npm install

# Create .env.local for local backend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

npm run dev
```

- Home: http://localhost:3002
- Products: http://localhost:3002/products
- Contact: http://localhost:3002/contact
- Profile: http://localhost:3002/profile

---

## Integration Testing

### Recommended Tools

- **Vitest** or **Jest** + React Testing Library
- Mock `next/navigation`, `next/headers`, and API clients

### What to Test

- Client components with `@testing-library/react`
- Server components by rendering
- Mock `serverNewsApi` for pages that fetch from Django
- Contact page and site settings (from DB) rendering
- Profile business hours and site settings forms (owner-only)

### Example Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

## End-to-End Testing

### Recommended Tool

**Cypress**. See [docs/CYPRESS_GUIDE.md](../docs/CYPRESS_GUIDE.md) for setup and best practices.

### Prerequisites

- Django running at `http://localhost:8000`
- Plant Sanctuary company with products

### Critical Flows to Test

- Auth: login, logout, register
- Products list and detail
- Cart and checkout
- Profile (orders, business hours, site settings)
- Contact page – verify contact info and business hours come from API, not hardcoded

### Cypress Config

Use `baseUrl: 'http://localhost:3002'` in `cypress.config.js`.

---

## Best Testing Practices

- Same Next.js practices as past-and-present and river-side-herald; use `data-cy` for stable selectors; log in via `cy.request()` + `cy.session()` for speed; use `beforeEach` for shared setup, not `afterEach` for cleanup
- **Focus on e-commerce flows**: products, cart, checkout, orders, profile
- **Test contact page** and site settings (from DB) rendering
- **Test profile business hours and site settings forms** (owner-only)
- **E2E**: verify contact info and business hours come from API, not hardcoded

---

## Learning Focus

- Next.js App Router testing
- E-commerce + articles combined flows
- Site settings and contact from database
- Owner-only form access

---

## Suggested Test Order

1. Add Vitest/Jest + RTL; test one client component
2. Mock API and test contact page (site settings data)
3. Add Cypress; test login and product list
4. Add E2E for cart and checkout
5. Add E2E for profile (business hours, site settings)
6. Verify contact page and footer use API data
