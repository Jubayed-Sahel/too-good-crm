# Component Architecture Documentation

This document describes the modular component architecture for the LeadGrid CRM web frontend built with **React**, **TypeScript**, and **Chakra UI**.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Component Categories](#component-categories)
3. [Component Details](#component-details)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)

---

## Project Structure

```
src/
├── components/
│   ├── auth/                    # Authentication-related components
│   │   ├── AuthLayout.tsx
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── DashboardHeader.tsx
│   │   ├── WelcomeBanner.tsx
│   │   ├── StatCard.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── InfoCard.tsx
│   │   └── InfoCardsGrid.tsx
│   ├── common/                 # Reusable common components
│   │   ├── Card.tsx
│   │   ├── GradientBox.tsx
│   │   ├── IconBox.tsx
│   │   ├── PageContainer.tsx
│   │   └── index.ts
│   └── ui/                     # Base UI components (Chakra UI wrappers)
├── pages/                      # Page-level components
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── DashboardPage.tsx
├── theme/                      # Chakra UI theme configuration
└── types/                      # TypeScript type definitions
```

---

## Component Categories

### 1. **Authentication Components** (`components/auth/`)
Components related to user authentication and authorization flows.

### 2. **Dashboard Components** (`components/dashboard/`)
Components specific to the dashboard view, including stats, cards, and headers.

### 3. **Common Components** (`components/common/`)
Reusable components that can be used across different pages and features.

### 4. **Page Components** (`pages/`)
Top-level page components that compose smaller components together.

---

## Component Details

### Authentication Components

#### **AuthLayout**
A layout wrapper for authentication pages (login/signup).

**Features:**
- Split-screen design with branding on left, form on right
- Responsive - hides branding on mobile devices
- Gradient background with company logo
- Centered form container

**Props:**
```typescript
interface AuthLayoutProps {
  children: ReactNode;
}
```

**Usage:**
```tsx
<AuthLayout>
  <LoginForm />
</AuthLayout>
```

---

#### **LoginForm**
Complete login form with validation and state management.

**Features:**
- Email and password inputs
- Password visibility toggle
- Form validation
- Loading states
- Toast notifications
- Link to signup page
- "Forgot password" link

**State:**
- `email`: string
- `password`: string
- `showPassword`: boolean
- `isLoading`: boolean

---

#### **SignupForm**
Complete registration form with validation.

**Features:**
- Name, email, password, and confirm password inputs
- Password visibility toggles
- Terms and conditions checkbox
- Form validation (matching passwords)
- Loading states
- Toast notifications
- Link to login page

**State:**
- `formData`: { name, email, password, confirmPassword }
- `showPassword`: boolean
- `showConfirmPassword`: boolean
- `agreeToTerms`: boolean
- `isLoading`: boolean

---

### Dashboard Components

#### **DashboardHeader**
Top navigation bar for the dashboard.

**Features:**
- Company logo and branding
- Dashboard title
- Sign out button
- Responsive container

**Functionality:**
- Handles user logout
- Navigates to login page on sign out

---

#### **WelcomeBanner**
Eye-catching welcome message banner.

**Features:**
- Gradient background (purple to blue)
- Welcome message
- Decorative SVG icon
- Responsive design

---

#### **StatCard**
Individual statistics display card.

**Props:**
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change: string;
  iconBg: string;
  iconColor: string;
}
```

**Features:**
- Icon with customizable background
- Change percentage badge (auto-colored based on +/-)
- Hover effects
- Clean, modern design

**Example:**
```tsx
<StatCard
  title="Total Customers"
  value="1,234"
  icon={<FiUsers />}
  change="+12%"
  iconBg="purple.100"
  iconColor="purple.600"
/>
```

---

#### **StatsGrid**
Grid container for multiple StatCards.

**Features:**
- Responsive grid (1 column mobile, 3 columns desktop)
- Pre-configured stats for Customers, Deals, and Revenue
- Consistent spacing

---

#### **InfoCard**
Informational card with icon and custom content.

**Props:**
```typescript
interface InfoCardProps {
  title: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  children: ReactNode;
}
```

**Usage:**
```tsx
<InfoCard
  title="Getting Started"
  icon={<FiInfo />}
  iconBg="blue.100"
  iconColor="blue.600"
>
  <Text>Your content here...</Text>
</InfoCard>
```

---

#### **InfoCardsGrid**
Grid container for informational cards.

**Features:**
- 2-column responsive grid
- Pre-configured "Authentication Successful" and "Getting Started" cards
- Consistent spacing and layout

---

### Common Components

#### **Card**
Versatile card component with multiple variants.

**Props:**
```typescript
interface CardProps extends BoxProps {
  variant?: 'elevated' | 'outline' | 'subtle';
}
```

**Variants:**
- `elevated`: White background with shadow and border
- `outline`: White background with prominent border
- `subtle`: Light gray background

**Example:**
```tsx
<Card variant="elevated">
  <Heading>Title</Heading>
  <Text>Content</Text>
</Card>
```

---

#### **GradientBox**
Box with pre-defined gradient backgrounds.

**Props:**
```typescript
interface GradientBoxProps extends BoxProps {
  variant?: 'purple-blue' | 'blue-teal' | 'pink-orange';
}
```

**Variants:**
- `purple-blue`: Purple to violet gradient
- `blue-teal`: Blue to teal gradient
- `pink-orange`: Pink to orange gradient

**Example:**
```tsx
<GradientBox variant="purple-blue">
  <Heading color="white">Featured Content</Heading>
</GradientBox>
```

---

#### **IconBox**
Flexible icon container with size and color variants.

**Props:**
```typescript
interface IconBoxProps extends FlexProps {
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'purple' | 'blue' | 'green' | 'red' | 'orange';
}
```

**Sizes:**
- `sm`: 8x8
- `md`: 10x10
- `lg`: 12x12

**Example:**
```tsx
<IconBox
  icon={<FiUsers />}
  size="md"
  colorScheme="purple"
/>
```

---

#### **PageContainer**
Standard page wrapper with consistent spacing.

**Props:**
```typescript
interface PageContainerProps extends ContainerProps {
  children: ReactNode;
  withPadding?: boolean;
}
```

**Features:**
- Full viewport height
- Gray background
- Max width container (7xl)
- Optional padding

**Example:**
```tsx
<PageContainer>
  <YourPageContent />
</PageContainer>
```

---

## Usage Examples

### Creating a New Dashboard Page

```tsx
import { VStack } from '@chakra-ui/react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { PageContainer } from '../components/common';

const NewPage = () => {
  return (
    <>
      <DashboardHeader />
      <PageContainer>
        <VStack gap={6} align="stretch">
          {/* Your page content */}
        </VStack>
      </PageContainer>
    </>
  );
};
```

### Creating a Custom Stat

```tsx
import StatCard from '../components/dashboard/StatCard';
import { FiTrendingUp } from 'react-icons/fi';

<StatCard
  title="Conversion Rate"
  value="24.5%"
  icon={<FiTrendingUp />}
  change="+5.2%"
  iconBg="green.100"
  iconColor="green.600"
/>
```

### Using Common Components

```tsx
import { Card, IconBox, GradientBox } from '../components/common';
import { Heading, Text } from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';

<Card variant="elevated">
  <IconBox icon={<FiStar />} colorScheme="purple" size="lg" />
  <Heading size="md" mt={4}>Premium Feature</Heading>
  <Text>Description here...</Text>
</Card>
```

---

## Best Practices

### 1. **Component Composition**
- Break complex components into smaller, focused pieces
- Use composition over prop drilling
- Keep components single-responsibility

### 2. **TypeScript**
- Always define prop interfaces
- Use `type` imports for better tree-shaking
- Extend Chakra UI props where needed

### 3. **Styling**
- Use Chakra UI's style props over custom CSS
- Leverage the theme for consistent colors and spacing
- Use responsive props for mobile-first design

### 4. **State Management**
- Keep local state in components when possible
- Use React Query for server state
- Consider context for shared UI state

### 5. **Accessibility**
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation works

### 6. **Performance**
- Lazy load heavy components
- Memoize expensive computations
- Use proper React keys in lists

---

## Adding New Components

When adding new components:

1. **Choose the right category**
   - Is it page-specific or reusable?
   - Does it fit an existing category?

2. **Define clear prop interfaces**
   ```typescript
   interface MyComponentProps {
     title: string;
     isActive?: boolean;
   }
   ```

3. **Use Chakra UI components**
   - Leverage existing components
   - Extend with custom props

4. **Document the component**
   - Add JSDoc comments
   - Update this README
   - Provide usage examples

5. **Export properly**
   - Add to index.ts if in common/
   - Use named exports for clarity

---

## Integration with Backend

To connect these components to your Django backend:

1. Update API service (`src/services/api.ts`)
2. Create custom hooks for data fetching
3. Replace mock data with actual API calls
4. Add error handling and loading states
5. Implement authentication token management

Example:
```tsx
// In useCustomers.ts
export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/api/customers/'),
  });
};

// In component
const { data: customers, isLoading } = useCustomers();
```

---

## Resources

- [Chakra UI Documentation](https://chakra-ui.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)

---

**Last Updated:** October 31, 2025
