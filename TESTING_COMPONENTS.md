# Plant Sanctuary – Testing Components

Component inventory and testing structure. See [docs/TESTING_COMPONENTS.md](../docs/TESTING_COMPONENTS.md) for ecosystem overview.

---

## Component Inventory

### Lib

| Module | Path | Test Status |
|--------|------|-------------|
| api | src/lib/api.ts | Tested (api.test.ts) |
| api-server | src/lib/api-server.ts | Not tested |
| types | src/lib/types.ts | Not tested |

### Contexts

| Context | Path | Test Status |
|---------|------|-------------|
| AuthContext | src/contexts/AuthContext.tsx | Not tested |
| CartContext | src/contexts/CartContext.tsx | Not tested |
| ToastContext | src/contexts/ToastContext.tsx | Not tested |

### Auth (Pages)

| Page | Path | Test Status |
|------|------|-------------|
| Login | src/app/login/page.tsx | E2E |
| Register | src/app/register/page.tsx | E2E |

### Products Components

| Component | Path | Test Status |
|-----------|------|-------------|
| ProductCard | src/components/products/ProductCard.tsx | Not tested |
| ProductForm | src/components/products/ProductForm.tsx | Not tested |
| CategoryManager | src/components/products/CategoryManager.tsx | Not tested |
| AdminActions | src/components/products/AdminActions.tsx | Not tested |
| AddToCartButton | src/app/products/[slug]/AddToCartButton.tsx | E2E |

### Layout Components

| Component | Path | Test Status |
|-----------|------|-------------|
| Header | src/components/layout/Header.tsx | Not tested |
| ClientHeader | src/components/layout/ClientHeader.tsx | Not tested |
| MobileNav | src/components/layout/MobileNav.tsx | Not tested |
| Footer | src/components/layout/Footer.tsx | Not tested |
| FooterClient | src/components/layout/FooterClient.tsx | Not tested |

### Other Components

| Component | Path | Test Status |
|-----------|------|-------------|
| ContactForm | src/app/contact/ContactForm.tsx | Not tested |
| Toast | src/components/ui/Toast.tsx | Not tested |

---

## Test Coverage Status

| Type | Exists | Gaps |
|------|--------|------|
| Unit | api.test.ts | contexts, ProductCard, ProductForm, etc. |
| Integration | None | AuthContext, CartContext, ToastContext |
| E2E | login.cy.js | register, products, cart, checkout |

---

## Component-to-Test Mapping

| Component | Unit | Integration | E2E |
|-----------|------|-------------|-----|
| api.ts | Yes | - | - |
| AuthContext | - | Add | - |
| CartContext | - | Add | - |
| ToastContext | - | Add | - |
| ProductCard | Add | - | Add |
| ProductForm | Add | - | Add |
| CategoryManager | Add | - | Add |
| Login page | - | - | Yes |
| Register page | - | - | Add |
| Products page | - | - | Add |
| Cart page | - | - | Add |
| Checkout page | - | - | Add |

---

## data-cy Registry

| Selector | Location |
|----------|----------|
| login-username | login page |
| login-password | login page |
| login-submit | login page |
| register-full-name | register page |
| register-email | register page |
| register-password | register page |
| register-submit | register page |
| product-card | ProductCard |
| add-to-cart | AddToCartButton |
| cart-item | cart page |
| checkout-link | cart page |
| checkout-submit | checkout page |

---

## Test File Layout

```
plant-sanctuary/
├── src/
│   ├── test/setup.ts
│   ├── lib/
│   │   ├── api.ts
│   │   └── api.test.ts
│   ├── contexts/
│   │   └── AuthContext.tsx  (add AuthContext.test.tsx)
│   └── components/
│       └── products/
│           └── ProductCard.tsx  (add ProductCard.test.tsx)
├── cypress/
│   ├── config.js
│   ├── support/e2e.js
│   └── e2e/
│       ├── login.cy.js
│       ├── register.cy.js  (add)
│       ├── products.cy.js  (add)
│       ├── cart.cy.js  (add)
│       └── checkout.cy.js  (add)
└── vitest.config.ts
```
