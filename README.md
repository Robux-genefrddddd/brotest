# VanIA - AI Platform

A complete, production-ready AI platform built with Next.js 14, Firebase, and OpenRouter.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 3
- **UI Components**: shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: OpenRouter (with amazon/nova-2-lite-v1:free for support)
- **State Management**: Zustand
- **Animations**: Framer Motion

## Features

- ✅ Secure Firebase Authentication
- ✅ Complete Firestore integration with strict security rules
- ✅ Input sanitization and injection prevention
- ✅ Role-based access control (RBAC)
- ✅ Three-tier pricing plans (Free, Classic, Pro)
- ✅ License key verification system
- ✅ AI-powered support system
- ✅ Admin panel with full management capabilities
- ✅ Action logging and audit trails
- ✅ Support ticket management
- ✅ Quota-based usage limits

## Project Structure

```
/app                    # Next.js App Router
  /api                  # API Routes
    /auth               # Authentication endpoints
    /chat               # Chat API endpoints
    /support            # Support API endpoints
    /license            # License verification
    /admin              # Admin panel endpoints
  /layout.tsx           # Root layout
  /page.tsx             # Home page
  /globals.css          # Global styles

/components             # React components
  /ui                   # shadcn/ui components

/lib                    # Utility functions
  firebase.ts           # Firebase initialization
  sanitize.ts           # Input sanitization
  permissions.ts        # RBAC permissions
  openrouter.ts         # OpenRouter integration
  utils.ts              # Helper functions

/types                  # TypeScript type definitions

/firebase               # Firebase configuration
  firestore.rules       # Firestore security rules

/public                 # Static assets
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Firebase and OpenRouter credentials:

```bash
# Firebase Configuration (Public - safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# OpenRouter API Key (Server-side only)
OPENROUTER_API_KEY=...

# Firebase Admin SDK (Server-side only)
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_PRIVATE_KEY=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
# Edit .env.local with your Firebase and OpenRouter credentials
```

### 3. Deploy Firestore Rules

Deploy the security rules to your Firebase project:

```bash
firebase deploy --only firestore:rules
```

### 4. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Chat
- `POST /api/chat/send-message` - Send chat message
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversations` - Create conversation

### Support
- `POST /api/support/send-message` - Send support message
- `GET /api/support/tickets` - Get support tickets

### License
- `POST /api/license/verify` - Verify license key

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - List users
- `POST /api/admin/users/ban` - Ban user
- `POST /api/admin/licenses/generate` - Generate license key

## Security Features

### Input Sanitization
All user inputs are sanitized to prevent:
- XSS (Cross-Site Scripting)
- NoSQL Injection
- SQL Injection

Located in `/lib/sanitize.ts`

### Firestore Security Rules
Strict security rules enforce:
- User can only read/write their own data
- Admin-only operations for sensitive data
- Prevent modification of roles, plans, and quotas
- No anonymous access

Located in `/firebase/firestore.rules`

### Role-Based Access Control (RBAC)
Three roles with specific permissions:
- **Founder**: Full access, can modify AI settings
- **Admin**: Extended access, cannot modify core settings
- **Support**: Can manage support tickets
- **User**: Regular user access

Located in `/lib/permissions.ts`

## Key Components

### Sanitize Utility (`/lib/sanitize.ts`)
Provides functions for sanitizing:
- General input strings
- Email addresses
- URLs
- JSON objects

### Permissions Utility (`/lib/permissions.ts`)
Implements RBAC with:
- Role-based permission checking
- Permission lists for each role
- Helper functions for specific access controls

### OpenRouter Integration (`/lib/openrouter.ts`)
Handles AI responses with:
- Chat message sending
- Support model integration
- Token estimation
- Error handling

## Database Schema

### Collections

#### Users
- `id`: User ID (Firebase Auth UID)
- `email`: User email
- `name`: User display name
- `role`: 'user' | 'admin' | 'founder'
- `plan`: 'free' | 'classic' | 'pro'
- `status`: 'active' | 'banned' | 'suspended'
- `quotaUsed`: Number of messages used
- `quotaLimit`: Maximum messages for plan
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

#### Conversations
- `id`: Conversation ID
- `userId`: Owner user ID
- `title`: Conversation title
- `model`: AI model used
- `archived`: Boolean
- `createdAt`: Timestamp
- `updatedAt`: Timestamp
- `messages`: Array of message objects

#### SupportTickets
- `id`: Ticket ID
- `userId`: Creator user ID
- `status`: 'open' | 'in_review' | 'closed'
- `priority`: 'low' | 'medium' | 'high' | 'urgent'
- `messages`: Array of support messages
- `createdAt`: Timestamp
- `updatedAt`: Timestamp
- `closedAt`: Timestamp (optional)

#### Licenses
- `id`: License ID
- `key`: License key (hashed)
- `planTarget`: Target plan
- `status`: 'active' | 'used' | 'revoked'
- `usageLimit`: Maximum uses
- `usageCount`: Current uses
- `createdAt`: Timestamp
- `usedAt`: Timestamp (optional)

## Next Steps for Implementation

1. **Set up Firebase Project**
   - Create Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Deploy security rules

2. **Implement Authentication Pages**
   - Login page
   - Register page
   - Password reset page

3. **Build Chat Interface**
   - Chat page with conversation sidebar
   - Message list and input
   - OpenRouter integration

4. **Create Admin Panel**
   - Dashboard
   - User management
   - License management
   - Support ticket management

5. **Add Support System**
   - Support page
   - Ticket creation and management
   - Amazon Nova model integration

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Works with any Node.js hosting that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- Google Cloud Run

## License

MIT

## Support

For issues and questions, please create a support ticket through the in-app support system.
