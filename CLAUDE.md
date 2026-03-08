# CLAUDE.md — AmazonAPP

This file provides AI assistants (Claude and others) with essential context
about this repository: its purpose, structure, conventions, and workflows.

---

## Project Overview

**AmazonAPP** is an e-commerce web application inspired by Amazon's shopping
experience. It is intended to support product browsing, user authentication,
shopping carts, orders, and payments.

> **Note:** This repository was initialized empty. Update this file as the
> codebase grows and concrete decisions are made.

---

## Repository Status

- **State:** Newly initialized — no source code committed yet.
- **Remote:** `http://local_proxy@127.0.0.1:34171/git/RyzenG/AmazonAPP`
- **Default working branch:** `main` (or `master`, update once established)
- **AI development branches:** Always prefixed with `claude/`

---

## Expected Technology Stack

Fill in the chosen technologies as the project is scaffolded.

| Layer          | Technology (TBD)                          |
|----------------|-------------------------------------------|
| Frontend       | React / Next.js / Vue / Angular           |
| Styling        | Tailwind CSS / CSS Modules / Styled Comps |
| Backend        | Node.js + Express / NestJS / Django / ... |
| Database       | PostgreSQL / MongoDB / MySQL              |
| Auth           | JWT / OAuth 2.0 / NextAuth                |
| Payments       | Stripe / PayPal                           |
| File Storage   | AWS S3 / Cloudinary                       |
| Deployment     | Docker + AWS / Vercel / Railway           |
| CI/CD          | GitHub Actions                            |
| Testing        | Jest / Vitest / Pytest / Cypress          |

---

## Anticipated Directory Structure

```
AmazonAPP/
├── client/                  # Frontend application
│   ├── public/
│   ├── src/
│   │   ├── assets/          # Images, icons, fonts
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # Global state (Context API / Redux)
│   │   ├── services/        # API call helpers
│   │   ├── utils/           # Shared utilities
│   │   └── styles/          # Global CSS / theme
│   ├── package.json
│   └── tsconfig.json
│
├── server/                  # Backend application
│   ├── src/
│   │   ├── config/          # DB, env, and app config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Auth, error handling, validation
│   │   ├── models/          # Database models / schemas
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic layer
│   │   └── utils/           # Backend helpers
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                  # Types / constants shared by client & server
├── tests/                   # End-to-end and integration tests
├── docker-compose.yml
├── .env.example
├── .gitignore
└── CLAUDE.md                # This file
```

---

## Core Domain Concepts

Understanding these concepts helps when reading or writing code.

| Concept      | Description                                                   |
|--------------|---------------------------------------------------------------|
| **Product**  | An item listed for sale with price, images, stock, category  |
| **User**     | Authenticated shopper or admin account                        |
| **Cart**     | Temporary collection of products before checkout             |
| **Order**    | A confirmed purchase with line items, totals, and status     |
| **Review**   | A user-submitted rating and comment on a product             |
| **Category** | Hierarchical product grouping (e.g., Electronics > Phones)   |
| **Address**  | A saved shipping address linked to a user                    |
| **Payment**  | Payment record tied to an order                              |

---

## Key API Routes (Planned)

```
GET    /api/products                  List / search products
GET    /api/products/:id              Single product detail
POST   /api/products                  Create product (admin)
PUT    /api/products/:id              Update product (admin)
DELETE /api/products/:id              Delete product (admin)

POST   /api/auth/register             Register new user
POST   /api/auth/login                Login, returns JWT
POST   /api/auth/logout               Invalidate session
GET    /api/auth/me                   Current user profile

GET    /api/cart                      Get user's cart
POST   /api/cart/items                Add item to cart
PUT    /api/cart/items/:id            Update item quantity
DELETE /api/cart/items/:id            Remove item from cart

POST   /api/orders                    Place an order (checkout)
GET    /api/orders                    List user's orders
GET    /api/orders/:id                Order detail
PATCH  /api/orders/:id/status         Update order status (admin)

POST   /api/payments/intent           Create payment intent (Stripe)
POST   /api/payments/webhook          Handle Stripe webhook events
```

---

## Development Workflow

### Branching Strategy

```
main              Production-ready code
develop           Integration branch for features
feature/<name>    New features
fix/<name>        Bug fixes
claude/<name>     AI-assisted work (auto-created by Claude Code)
```

### Starting Development

```bash
# Install dependencies
npm install               # or yarn / pnpm install

# Copy environment variables
cp .env.example .env
# Fill in values in .env

# Start database (if using Docker)
docker-compose up -d db

# Run development servers
npm run dev               # starts both client and server (if monorepo)
# or separately:
cd client && npm run dev
cd server && npm run dev
```

### Building for Production

```bash
npm run build             # Build all workspaces
npm run start             # Start production server
```

---

## Environment Variables

Expected variables (document actual values in `.env`, never commit secrets):

```bash
# Server
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/amazonapp
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS / Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=us-east-1

# Client
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## Testing

```bash
# Unit tests
npm run test

# Unit tests with watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# End-to-end tests
npm run test:e2e
```

### Testing Conventions

- Unit tests live next to the file they test: `foo.ts` → `foo.test.ts`
- Integration/E2E tests live in `tests/`
- Use descriptive `describe` / `it` blocks
- Mock external services (Stripe, AWS) in unit tests
- Aim for >80% coverage on business logic

---

## Code Conventions

### General

- Language: **TypeScript** preferred throughout (update if different choice made)
- Formatter: **Prettier** — run `npm run format` before committing
- Linter: **ESLint** — run `npm run lint`
- Commit messages follow **Conventional Commits**:
  ```
  feat: add product image carousel
  fix: correct cart total calculation
  refactor: extract order service logic
  docs: update API route table in CLAUDE.md
  ```

### Naming

| Thing             | Convention          | Example                    |
|-------------------|---------------------|----------------------------|
| Files (TS/JS)     | camelCase           | `cartService.ts`           |
| React components  | PascalCase          | `ProductCard.tsx`          |
| CSS modules       | camelCase           | `productCard.module.css`   |
| Database tables   | snake_case          | `order_items`              |
| Environment vars  | SCREAMING_SNAKE_CASE | `JWT_SECRET`              |
| API routes        | kebab-case          | `/api/product-reviews`     |
| Git branches      | kebab-case          | `feature/product-filters`  |

### Component Structure (React)

```tsx
// 1. Imports
import React from 'react'
import { useCart } from '@/hooks/useCart'

// 2. Types
interface Props {
  productId: string
  onAdd?: () => void
}

// 3. Component
export function AddToCartButton({ productId, onAdd }: Props) {
  const { addItem } = useCart()

  const handleClick = () => {
    addItem(productId)
    onAdd?.()
  }

  return <button onClick={handleClick}>Add to Cart</button>
}
```

### API Error Handling

All API errors should follow this shape:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "No product found with the given ID",
    "statusCode": 404
  }
}
```

Successful responses:

```json
{
  "success": true,
  "data": { ... }
}
```

---

## Security Checklist

- Never commit secrets or `.env` files
- Validate and sanitize all user inputs server-side
- Use parameterized queries / ORM to prevent SQL injection
- Enforce authentication middleware on protected routes
- Rate-limit auth endpoints
- Use HTTPS in production
- Sanitize HTML in user-generated content (reviews, etc.)
- Follow the principle of least privilege for DB users and IAM roles

---

## AI Assistant Guidelines (Claude-specific)

When working in this repository, Claude should:

1. **Read before writing** — always read existing files before modifying them.
2. **Match existing style** — follow the naming and formatting conventions
   above; do not impose new patterns without discussion.
3. **Keep PRs focused** — one feature or fix per branch/PR.
4. **Never commit secrets** — if environment values are needed, use
   `.env.example` with placeholder values.
5. **Run tests** — after changes, verify tests pass with `npm run test`.
6. **Update this file** — when new conventions, tools, or structures are
   introduced, update CLAUDE.md accordingly.
7. **Use the designated branch** — AI work goes to `claude/<session-id>`
   branches; never push to `main` directly.
8. **Document API changes** — update the API Routes section when endpoints
   are added or changed.
9. **Prefer editing over creating** — avoid unnecessary new files; extend
   existing modules where sensible.
10. **Ask before big refactors** — large structural changes should be
    discussed before implementation.

---

## Useful Commands Reference

```bash
# Lint
npm run lint
npm run lint:fix

# Format
npm run format

# Test
npm run test
npm run test:coverage
npm run test:e2e

# Database (examples)
npm run db:migrate          # Run pending migrations
npm run db:migrate:undo     # Rollback last migration
npm run db:seed             # Seed development data

# Docker
docker-compose up -d        # Start all services
docker-compose down         # Stop all services
docker-compose logs -f      # Tail logs

# Git helpers
git log --oneline -10       # Recent commits
git diff main               # Diff against main
```

---

## Updating This File

This file should be updated whenever:

- A new major dependency or tool is adopted
- The directory structure changes significantly
- New environment variables are required
- API contracts change
- Development workflow steps change
- New code conventions are agreed upon

*Last updated: 2026-03-08 — repository initialization (no source code yet)*
