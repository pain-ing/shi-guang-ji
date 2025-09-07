# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**拾光集 (Shi-Guang-Ji)** is a modern personal life recording application built with Next.js 14, TypeScript, and Supabase. The application helps users record daily moments through check-ins, diary entries, and media management.

## Key Development Commands

### Building and Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Testing Single Components
Since this is a Next.js application, test individual pages by navigating to their routes:
- `/dashboard` - Main dashboard
- `/check-in` - Daily mood check-in
- `/diary` - Journal/diary functionality  
- `/diary/new` - Create new diary entry
- `/media` - Media library
- `/profile` - User profile management

## High-Level Architecture

### Application Structure
The project follows Next.js 14 App Router pattern with a clear separation of concerns:

**Route Groups:**
- `(auth)/*` - Authentication pages (login, register, forgot password)
- `(dashboard)/*` - Protected dashboard pages requiring authentication
- `(admin)/*` - Admin-only functionality

### State Management Architecture
The application uses **Zustand** for client-side state management with two primary stores:

1. **authStore** (`src/stores/authStore.ts`):
   - Handles user authentication, session management, and profile data
   - Implements security features: login attempt auditing, session timeout (30min idle, 24hr absolute)
   - Auto-creates user profiles when missing
   - Manages Supabase auth integration

2. **checkInStore** (`src/stores/checkInStore.ts`):
   - Manages daily mood check-ins and statistics
   - Provides utility functions for streak calculation and mood analytics
   - Handles date range queries and calendar data

### Database Design
The application uses **Supabase** (PostgreSQL) with Row Level Security (RLS):

**Core Tables:**
- `profiles` - User profiles with avatar and bio
- `check_ins` - Daily mood check-ins with 8 mood types
- `diaries` - Rich text journal entries with TipTap editor
- `media` - File metadata for uploaded content (images, videos, audio, documents)
- `tags` / `diary_tags` - Tagging system for diary entries

### Security Architecture
Comprehensive security implementation in `src/lib/security/`:

- **RBAC** (`rbac.ts`): Role-based access control with admin user detection
- **Password validation** (`password.ts`): Strong password requirements
- **Audit logging** (`logger.ts`): Security event tracking
- **Middleware** (`src/middleware.ts`): Session timeout, route protection, automatic redirects

### Authentication Flow
1. **Registration**: Server-side signup API route with password validation
2. **Login**: Client-side Supabase auth with server-side rate limiting and audit logging
3. **Session Management**: 30-minute idle timeout, 24-hour absolute timeout
4. **Auto-redirects**: Authenticated users → dashboard, unauthenticated → login

### Component Organization
- `components/ui/*` - Shadcn/ui based design system components
- `components/auth/*` - Authentication guards and providers
- `components/check-in/*` - Daily check-in functionality (mood selector, calendar, stats)
- `components/diary/*` - Rich text editing with TipTap and Markdown support
- `components/media/*` - File upload and media grid management
- `components/layout/*` - Dashboard layout, header, sidebar
- `components/common/*` - Shared utilities (loading, error boundary, dialogs)

### File Upload System
Uses Supabase Storage with two buckets:
- `avatars` - Public bucket for profile pictures
- `media` - Private bucket with RLS policies for user file isolation

## Environment Requirements

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development Setup
1. Install Node.js 18+
2. Run `npm install`
3. Copy `.env.local` from root Supabase setup guide
4. Follow `SUPABASE_SETUP.md` for database configuration
5. Run `npm run dev`

## Key Technical Patterns

### Error Handling
- Global ErrorBoundary wraps the entire application
- Store-level error states in Zustand stores
- API routes return consistent error formats
- Security events are logged for audit purposes

### Data Fetching
- Direct Supabase client calls from stores
- No additional data fetching library (no SWR/React Query)
- Optimistic updates in stores for better UX
- Auto-save functionality in diary editor

### TypeScript Integration
- Comprehensive database types defined in `src/lib/supabase.ts`
- Strong typing throughout the application
- Type-safe Supabase client usage

### UI/UX Patterns
- Shadcn/ui components for consistent design
- Responsive design with mobile-first approach
- Toast notifications for user feedback
- Confirmation dialogs for destructive actions
- Auto-saving with loading states

## Deployment Architecture

The application is designed for **Vercel** deployment with:
- Static optimization for public pages
- API routes for server-side operations (auth, security)
- Edge middleware for session management
- Integration with Supabase for backend services

Refer to `shi-guang-ji/DEPLOYMENT.md` and `shi-guang-ji/DEPLOYMENT_CHECKLIST.md` for complete deployment procedures.
