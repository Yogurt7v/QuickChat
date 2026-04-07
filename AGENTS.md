# AGENTS.md - QuickChat Development Guide

## Build, Lint & Test Commands

```bash
# Development
npm run dev              # Start Vite dev server

# Build
npm run build           # TypeScript check + Vite build
npm run preview         # Preview production build

# Linting
npm run lint            # Run ESLint on all files

# Deployment
npm run deploy          # Build + Firebase deploy (hosting only)
npm run deploy:functions # Deploy Firebase Cloud Functions

# Local development
npm run emulators       # Start Firebase emulators
```

**Single Test Execution**: No test framework configured. To add tests, install Vitest or Jest.

## Code Style Guidelines

### General Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Backend**: Firebase (Auth, Firestore) + Supabase (storage)
- **Styling**: CSS Modules

### Formatting (Prettier)
- Semi: true, trailingComma: es5, singleQuote: true, printWidth: 80, tabWidth: 2

### Imports Order
1. External libraries (React, Firebase, Zustand)
2. Internal components
3. Hooks
4. Services/store
5. Types
6. Styles

### Types
- Use explicit types for function parameters and return values
- Prefer interfaces for object shapes
- Use `null` (not `undefined`) for nullable Firestore values

### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `useAuth.ts` |
| Components | PascalCase | `ChatArea.tsx` |
| Hooks | use prefix | `useAuth.ts` |
| Store | Store suffix | `authStore.ts` |
| Services | camelCase | `messageService.ts` |
| CSS Modules | .module.css | `ChatArea.module.css` |
| Constants | UPPER_SNAKE | `VAPID_PUBLIC_KEY` |

### Component Structure
```typescript
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useAuthStore } from '../store/authStore';
import styles from './Component.module.css';

interface Props {
  prop1: string;
  prop2?: number;
}

const Component: FC<Props> = ({ prop1, prop2 = 10 }) => {
  const { user } = useAuthStore();
  const [state, setState] = useState<string>('');

  useEffect(() => { ... }, [prop1]);

  return <div className={styles.container}>...</div>;
};

export default Component;
```

### Error Handling
- Use try/catch for async operations
- Log errors with `console.error`
- Use Russian for error messages (project language)

### State Management (Zustand)
```typescript
interface AuthState {
  user: User | null;
  setStoreUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  setStoreUser: user => set({ user }),
  logout: () => { ... },
}));
```

### Firebase Patterns
- Use `auth` from `./firebase/config`
- Collections: `users`, `chats`, `messages`
- Real-time via `onSnapshot`, auth via `onAuthStateChanged`

### CSS Modules
- Co-locate: `Component.tsx` + `Component.module.css`
- Use camelCase for class names
- Only global CSS: App.css, mainColors.css

### ESLint
- `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Run `npm run lint` before committing, fix with `npm run lint -- --fix`

### Things to Avoid
- NO `any` type
- NO `.env.local` commits
- NO `console.log` in production
- NO global CSS (use CSS Modules)
- Avoid inline styles except for dynamic values

### Project Structure
```
src/
├── components/    # chat/, layout/, modals/, profile/, sidebar/, ui/
├── constants.ts  # App constants
├── firebase/     # Firebase config
├── hooks/        # Custom hooks
├── services/     # Business logic + firestore/
├── store/        # Zustand stores
├── styles/       # Global CSS
├── supabase/     # Supabase client
├── types/        # TypeScript types
└── App.tsx       # Root
```

### Dependencies
- react/react-dom: ^19.1.1, firebase: ^12.4.0
- @supabase/supabase-js: ^2.86.2, zustand: ^5.0.8
- @dnd-kit/core: ^6.3.1, typescript: ~5.9.3, vite: ^7.1.7
