# Too Good CRM - Web Frontend

React + TypeScript + Vite web application for the Too Good CRM system.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

App runs at: `http://localhost:5173`

## Project Structure

- `src/`
  - `components/` - Reusable UI components
    - `auth/` - Authentication components
    - `common/` - Common/shared components
    - `dashboard/` - Dashboard components
    - `customers/`, `deals/`, `leads/`, etc. - Domain components
  - `pages/` - Page components (routes)
  - `features/` - Feature modules (new architecture)
    - `customers/` - Example feature module
  - `services/` - API service layer
  - `hooks/` - Custom React hooks
  - `contexts/` - React contexts (global state)
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions
  - `config/` - App configuration
  - `theme/` - Theme configuration
- `docs/` - Documentation (**organized!**)
- `public/` - Static assets
- `dist/` - Build output

See [docs/README.md](docs/README.md) for comprehensive documentation index.

## Key Features

- JWT Authentication with role-based access
- Customer, Lead, Deal, Employee management
- Issue tracking with Linear integration
- Analytics dashboard
- Role and Permission management
- Organization settings
- Client portal for customers

## Available Scripts

```bash
npm run dev         # Development server
npm run build       # Production build
npm run preview     # Preview build
npm run lint        # Run linter
```

## Architecture

### Hybrid Architecture

1. **Legacy Components** (`components/`, `hooks/`, `services/`)
   - Traditional React structure
   - Being migrated to feature modules

2. **Feature Modules** (`features/`)
   - Self-contained modules
   - Each has: components, hooks, types, pages
   - Example: `features/customers/`

### State Management

- React Query for server state
- Context API for global state
- Local state for component state

## Authentication

- JWT token-based authentication
- Auto token refresh
- Protected routes
- Permission-based rendering
- Role selection

See [docs/AUTH_IMPLEMENTATION.md](docs/AUTH_IMPLEMENTATION.md) for details.

## API Integration

API client with:
- Automatic token injection
- Token refresh handling
- Error interceptors
- Request/response logging (dev)

```typescript
import { customerService } from '@/services/customer.service';

const customers = await customerService.getCustomers();
```

## Styling

- **Tailwind CSS** - Utility-first CSS
- **Chakra UI** - Component library  
- **Custom Theme** - Design tokens

Theme configuration in `src/theme/`

## Documentation

Comprehensive documentation in `docs/`:

- [Auth Implementation](docs/AUTH_IMPLEMENTATION.md)
- [API Architecture](docs/API_ARCHITECTURE.md)
- [Permission Management](docs/PERMISSION_MANAGEMENT_GUIDE.md)
- [Role Management](docs/ROLE_MANAGEMENT_GUIDE.md)
- [Modularization Progress](docs/MODULARIZATION_PROGRESS.md)

See [docs/README.md](docs/README.md) for complete index.

## Development

### Adding New Features

1. Check [docs/MODULARIZATION_PROGRESS.md](docs/MODULARIZATION_PROGRESS.md)
2. Follow [docs/MIGRATION_CHECKLIST.md](docs/MIGRATION_CHECKLIST.md) for new feature modules
3. Use [docs/DIALOG_STANDARDIZATION_PLAN.md](docs/DIALOG_STANDARDIZATION_PLAN.md) for dialogs

### Testing

```bash
npm run test              # Run tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

## Troubleshooting

**CORS errors:** Check backend CORS settings  
**Auth issues:** Clear localStorage and re-login  
**Build errors:** Delete `node_modules` and reinstall

## Contributing

1. Create feature branch
2. Make changes
3. Write/update tests
4. Update documentation
5. Run linting: `npm run lint`
6. Submit pull request

