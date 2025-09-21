# MyNATCA Hub

Vue.js admin dashboard for the MyNATCA platform providing member management, facility administration, and analytics capabilities.

## Auth0 Integration Strategy

The Hub uses the **SAME Auth0 application** as the main MyNATCA platform for seamless authentication.

### How It Works

1. **Shared Auth0 App**: The Hub uses the existing platform Auth0 application
   - Domain: `natca-dev.us.auth0.com`
   - Same Client ID as the platform
   - Members authenticate once across all MyNATCA applications

2. **Custom Claims**: Auth0 provides MyNATCA-specific user claims:
   - `https://mynatca.org/member_number` - NATCA member number
   - `https://mynatca.org/positions` - Array of member positions
   - `https://mynatca.org/region` - Member's region code
   - `https://mynatca.org/facility` - Member's primary facility

3. **Platform Integration**:
   - Authentication state is shared across platform applications
   - Member data comes from the same Supabase database
   - No need to create separate Auth0 applications

### Configuration

```env
# Use the SAME Auth0 configuration as the platform
VITE_AUTH0_DOMAIN=natca-dev.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_platform_auth0_client_id
VITE_AUTH0_AUDIENCE=https://mynatca.org/api
```

### Auth0 Application Setup

**You DO NOT need to create a new Auth0 application.** Instead:

1. **Use Existing Platform Application**: Get the Client ID from the platform's Auth0 app
2. **Add Hub URLs**: Add the Hub's URLs to the platform's Auth0 application:
   - **Allowed Callback URLs**: `http://localhost:1301/`, `https://hub.natca.org/`
   - **Allowed Logout URLs**: `http://localhost:1301/`, `https://hub.natca.org/`
   - **Allowed Web Origins**: `http://localhost:1301`, `https://hub.natca.org`

## Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Update with actual platform Auth0 credentials
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Features

- **Dashboard**: Member welcome and quick actions
- **Profile Management**: Edit member information
- **Facilities Management**: Search and manage facilities
- **Analytics**: Interactive charts and member statistics
- **Infrastructure Monitoring**: Rackspace server status
- **Auth0 Integration**: Seamless platform authentication
- **Supabase Backend**: Real-time data from platform database

## Architecture

The Hub integrates with the existing MyNATCA platform infrastructure:

```
MyNATCA Platform Architecture
├── Platform (Next.js) - Core platform API and services
├── Discord Bot - Member verification and community
├── Hub (Vue.js) - Admin dashboard and member portal
├── Documentation - Nextra-based docs
└── Shared Infrastructure
    ├── Auth0 - Single authentication system
    ├── Supabase - PostgreSQL database with real-time
    └── Rackspace - Infrastructure monitoring
```

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **UI Framework**: Vuetify 3 + Material Design Icons
- **Authentication**: Auth0 SPA SDK (shared with platform)
- **Backend**: Supabase (shared with platform)
- **Charts**: ApexCharts for analytics
- **Infrastructure**: Rackspace API integration

## Production Deployment

### Environment Configuration

1. **Auth0 Setup**:
   - Ensure the Hub URLs are added to the platform's Auth0 application
   - Update production environment variables with actual credentials
   ```env
   VITE_AUTH0_DOMAIN=natca-dev.us.auth0.com
   VITE_AUTH0_CLIENT_ID=actual_platform_client_id
   VITE_AUTH0_AUDIENCE=https://mynatca.org/api
   ```

2. **Supabase Configuration**:
   - Use the same Supabase project as the platform
   - Configure production URL and anon key
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_production_anon_key
   ```

3. **Platform Integration**:
   - Set Platform API URL to production endpoint
   ```env
   VITE_PLATFORM_API_URL=https://api.mynatca.org
   ```

4. **Rackspace Monitoring**:
   - Configure production Rackspace credentials for infrastructure monitoring
   ```env
   VITE_RACKSPACE_API_ENDPOINT=https://api.rackspace.com
   VITE_RACKSPACE_REGION=your_production_region
   VITE_RACKSPACE_AUTH_TOKEN=your_rackspace_token
   ```

### Cross-Application Features

- **Shared Authentication**: Users logged into the platform are automatically logged into the Hub
- **Cross-Tab Logout**: Logging out from any MyNATCA application logs out from all
- **Unified Member Profile**: Member data is consistent across platform and Hub
- **Real-time Sync**: Changes in Supabase are reflected across all applications

### Security Considerations

- **Environment Variables**: Never commit production credentials to version control
- **Auth0 Configuration**: Ensure proper callback and logout URLs are configured
- **CORS Settings**: Configure Supabase and platform APIs for Hub domain access
- **Token Storage**: Auth0 tokens are stored securely with automatic refresh

### Deployment Checklist

- [ ] Environment variables configured for production
- [ ] Auth0 application updated with Hub URLs
- [ ] Supabase RLS policies allow Hub access
- [ ] Platform API configured for Hub domain
- [ ] Rackspace credentials configured for monitoring
- [ ] Build and deployment pipeline tested
- [ ] Cross-application logout functionality verified

## Scripts

- `npm run dev` - Start development server (port 1301)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - TypeScript type checking
- `npm run lint` - ESLint code linting
