# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

拾光集 (shi-guang-ji) is a personal life recording application built with Next.js 14, TypeScript, and Supabase. It allows users to record daily check-ins, write diaries with rich text editing, manage media files, and track personal statistics.

## Development Commands

### Core Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production version
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Type checking without emitting files
npm run type-check
```

### Database Commands (Supabase)
```bash
# Start local Supabase (if using local dev)
supabase start

# Push database migrations
supabase db push

# Generate TypeScript types from database
supabase gen types typescript --local > src/types/supabase.ts
```

### Environment Setup
Required environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **State Management**: Zustand for client state
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with custom session management
- **Rich Text**: TipTap editor for diary entries
- **Deployment**: Vercel

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Main app pages
│   ├── emergency-login/   # Emergency auth routes
│   └── layout.tsx         # Root layout with providers
├── components/
│   ├── auth/              # Authentication components
│   ├── check-in/          # Daily check-in features
│   ├── diary/             # Rich text diary editor
│   ├── media/             # File upload and media management
│   ├── layout/            # Dashboard layout components
│   ├── common/            # Reusable components
│   └── ui/                # Shadcn/ui base components
├── stores/                # Zustand state stores
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
└── types/                 # TypeScript type definitions
```

### Key Architectural Patterns

#### Authentication & Session Management
- Custom session timeout middleware with idle and absolute timeouts
- Row Level Security (RLS) enforced at database level
- Client-side auth state managed via Zustand store
- Automatic profile creation for new users

#### State Management Architecture
- **AuthStore**: User session, profile, and auth actions
- **CheckInStore**: Daily mood tracking and statistics
- **DiaryStore**: Journal entries with auto-save functionality
- **MediaStore**: File uploads and media library management

#### Database Design
Core tables with user isolation:
- `profiles`: User information and settings
- `check_ins`: Daily mood tracking (unique per user/date)
- `diaries`: Rich text journal entries
- `media`: File metadata for uploads
- `tags` + `diary_tags`: Tagging system for diary entries

#### Component Patterns
- **Layout Pattern**: Nested layouts for auth and dashboard sections
- **Provider Pattern**: AuthProvider wraps app for global auth state
- **Error Boundaries**: Graceful error handling throughout app
- **Loading States**: Consistent loading UX across components

## Development Guidelines

### Authentication Flow
- All routes under `/dashboard`, `/diary`, `/media`, `/profile`, `/check-in` are protected
- Session validation happens in middleware with automatic redirects
- Emergency login routes available for troubleshooting auth issues

### Database Operations
- All queries automatically filtered by user ID via RLS
- Use TypeScript types from `src/lib/supabase.ts` for type safety
- Profile creation is automatic but may need manual handling for edge cases

### State Management
- Use Zustand stores for complex state that needs to persist across components
- Auto-save functionality implemented for diary entries
- Error handling should be graceful and not block user workflows

### File Structure Conventions
- Group related components in feature folders (auth, check-in, diary, media)
- Separate UI components from business logic components
- Keep utility functions in `src/lib/`
- Database types and interfaces in `src/types/`

### Security Considerations
- Session timeout implementation with both idle and absolute limits
- All database operations protected by RLS policies
- File uploads go through Supabase Storage with proper permissions
- User data isolation enforced at database level

### Development Tips
- Use the emergency login route `/emergency-login` if authentication gets stuck
- Check browser console for detailed auth flow logging
- Database migrations are in `supabase/migrations/` directory
- TipTap editor configuration is in diary components for rich text editing

## Testing & Debugging

### Auth Debugging
- Debug script available at `debug-auth.js` for troubleshooting auth issues
- Emergency auth routes at `/emergency-login` and `/simple-login`
- Check middleware logs in browser console for session flow debugging

### Database Debugging
- RLS policies can be tested in Supabase dashboard
- Check user permissions and profile creation in `profiles` table
- Migration files show complete database schema evolution
