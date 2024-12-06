# Project Dependencies

## Core Dependencies

### Framework & Core
```json
{
  "next": "^13.4.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0"
}
```

### Styling
```json
{
  "tailwindcss": "^3.3.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0",
  "@heroicons/react": "^2.0.0",
  "clsx": "^2.0.0"
}
```

### Authentication & Authorization
```json
{
  "next-auth": "^4.22.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.0"
}
```

### Database & ORM
```json
{
  "mongoose": "^7.0.0",
  "mongodb": "^5.0.0"
}
```

### Form Handling & Validation
```json
{
  "react-hook-form": "^7.0.0",
  "zod": "^3.0.0",
  "@hookform/resolvers": "^3.0.0"
}
```

### API & Data Fetching
```json
{
  "axios": "^1.4.0",
  "swr": "^2.0.0"
}
```

### UI Components & Animation
```json
{
  "@headlessui/react": "^1.7.0",
  "framer-motion": "^10.0.0",
  "react-hot-toast": "^2.4.0",
  "date-fns": "^2.30.0"
}
```

### File Upload & Storage
```json
{
  "aws-sdk": "^2.1.0",
  "multer": "^1.4.5-lts.1",
  "sharp": "^0.32.0"
}
```

### Testing
```json
{
  "jest": "^29.0.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^5.16.0",
  "cypress": "^12.0.0",
  "msw": "^1.2.0"
}
```

### Development Tools
```json
{
  "eslint": "^8.40.0",
  "eslint-config-next": "13.4.0",
  "prettier": "^2.8.0",
  "husky": "^8.0.0",
  "lint-staged": "^13.2.0",
  "@types/node": "^20.0.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0"
}
```

### Monitoring & Analytics
```json
{
  "@sentry/nextjs": "^7.0.0",
  "next-axiom": "^0.17.0"
}
```

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Install dev dependencies:
```bash
npm install -D [dev-dependencies]
```

3. Setup Husky for git hooks:
```bash
npm run prepare
npx husky add .husky/pre-commit "npm run lint-staged"
```

4. Initialize Tailwind CSS:
```bash
npx tailwindcss init -p
```

## Recommended VSCode Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens
- Error Lens
- TypeScript Error Translator 