# Authentication Flow - Web Frontend

This document describes the authentication flow implementation for the Too Good CRM system.

## 📁 Project Structure

```
src/
├── components/
│   └── auth/
│       ├── AuthLayout.tsx      # Shared layout wrapper with gradient background
│       ├── LoginForm.tsx       # Login form component
│       └── SignupForm.tsx      # Signup form component
├── pages/
│   ├── LoginPage.tsx           # Login page
│   ├── SignupPage.tsx          # Signup page
│   └── DashboardPage.tsx       # Dashboard (mock landing page)
└── App.tsx                     # Main app with routing
```

## 🎨 Features

### 1. **Login Page** (`/login`)
- Email and password input fields
- Role selector dropdown (Employee / Vendor)
- Clean form validation
- Link to signup page
- Mock authentication (logs to console)

### 2. **Signup Page** (`/signup`)
- Full name, email, password, and confirm password fields
- Role selector with helpful descriptions
- Client-side validation (password length, password match)
- Link to login page
- Mock registration (logs to console)

### 3. **User Roles**
- **Vendor**: Organization owner who can create and manage their CRM
- **Employee**: Team member who joins an existing organization
  - Can be: Super Admin, Manager, Sales Rep, or Marketing Rep

### 4. **Design System**
- **Colors**: Soft gradient background (blue → indigo → purple)
- **Components**: Rounded corners, shadow effects, clean typography
- **Forms**: Focus states with indigo accent color
- **Responsive**: Mobile-first design, centered card layout
- **Accessibility**: Proper labels, semantic HTML

## 🚀 Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will start at `http://localhost:5173` (or another port if 5173 is busy).

## 🧭 Navigation

- `/` → Redirects to `/login`
- `/login` → Login page
- `/signup` → Signup page
- `/dashboard` → Dashboard (shown after successful login/signup)

## 📝 Usage

### Login Flow
1. Navigate to `/login`
2. Select your role (Employee or Vendor)
3. Enter email and password
4. Click "Sign In"
5. Console logs the attempt
6. Redirects to `/dashboard`

### Signup Flow
1. Navigate to `/signup`
2. Select your role (Employee or Vendor)
3. Fill in name, email, password, and confirm password
4. Form validates:
   - Password must be at least 6 characters
   - Passwords must match
5. Click "Create Account"
6. Console logs the attempt
7. Redirects to `/dashboard`

## 🔧 Technical Details

### Technologies Used
- **React 19** with TypeScript
- **React Router v6** for navigation
- **Tailwind CSS 4** for styling
- **Vite** for build tooling

### State Management
- Uses React's `useState` for form state
- No global state management (yet)
- Form validation handled locally

### Mock Authentication
Currently, the forms don't connect to a backend. They:
- Log form data to console
- Immediately redirect to dashboard

To connect to a real backend:
1. Replace `console.log()` calls with API calls
2. Add loading states
3. Handle errors and show feedback
4. Store auth tokens (localStorage or context)

## 🎯 Next Steps

- [ ] Connect to Django backend API
- [ ] Implement JWT token management
- [ ] Add loading spinners during auth
- [ ] Show error messages from backend
- [ ] Add "Remember me" functionality
- [ ] Implement password reset flow
- [ ] Add social login options
- [ ] Create protected routes
- [ ] Add role-based access control

## 📱 Screenshots

### Login Page
- Clean, centered card with gradient background
- Role selector for Vendor/Employee
- Email and password inputs
- Link to signup page

### Signup Page
- Extended form with name and password confirmation
- Inline validation errors
- Helpful role descriptions
- Link to login page

### Dashboard
- Simple success message
- Placeholder for actual CRM dashboard

## 🎨 Customization

### Colors
Edit the gradient in `AuthLayout.tsx`:
```tsx
<div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
```

### Branding
Update the title in `AuthLayout.tsx`:
```tsx
<h1 className="text-3xl font-bold text-gray-800 mb-2">Too Good CRM</h1>
```

### Validation Rules
Modify validation in `SignupForm.tsx`:
```tsx
if (formData.password.length < 6) {
  newErrors.password = 'Password must be at least 6 characters';
}
```
