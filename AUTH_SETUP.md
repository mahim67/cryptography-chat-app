# Authentication Middleware Setup

এই প্রজেক্টে একটি comprehensive authentication middleware system implement করা হয়েছে যা Next.js app এবং separate API server এর মধ্যে seamless authentication provide করে।

## 🚀 Features

- **JWT Token Verification**: API call এর মাধ্যমে real-time token verification
- **Automatic Token Refresh**: Expired token automatically refresh করা হয়
- **Route Protection**: Public এবং protected routes automatically handle করা হয়
- **API Integration**: Separate API server এর সাথে perfect integration
- **Error Handling**: Comprehensive error handling এবং user feedback
- **Debug Support**: Built-in debugging tools এবং status monitoring

## 📁 File Structure

```
cryptography-chat-app/
├── middleware.js                     # Main middleware file
├── contexts/
│   └── AuthContext.js               # Authentication context
├── hooks/
│   └── useAuthExtended.js           # Extended auth hook
├── lib/
│   ├── auth-utils.js                # Auth utilities
│   └── api-health.js                # API health check utilities
├── services/
│   └── auth-service.js              # Authentication services
├── components/
│   └── auth/
│       ├── AuthDebugPanel.js        # Debug panel component
│       └── ProtectedRoute.js        # Route protection component
└── app/
    └── debug/
        └── auth/
            └── page.js              # Debug page
```

## 🔧 Setup Instructions

### 1. Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3033/
API_BASE_URL=http://localhost:3033/
JWT_SECRET=your_jwt_secret_key
```

### 2. Install Dependencies

```bash
cd /var/www/cryptography-chat-app
npm install jsonwebtoken axios
```

### 3. API Server Setup

Ensure your API server (criptography) is running:

```bash
cd /var/www/criptography
node server.js
```

### 4. Test Setup

Run the test script:

```bash
./test-auth-setup.sh
```

## 🎯 How It Works

### Middleware Flow

1. **Route Checking**: Middleware checks if route needs authentication
2. **Token Extraction**: Gets token from cookies or Authorization header
3. **API Verification**: Calls profile API endpoint to verify token
4. **User Data**: Sets user information in request headers
5. **Route Protection**: Redirects unauthenticated users to login

### Authentication Context

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
    const { user, isAuthenticated, loading, login, logout } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    
    return (
        <div>
            {isAuthenticated ? (
                <div>Welcome, {user.name}!</div>
            ) : (
                <div>Please login</div>
            )}
        </div>
    );
}
```

### Extended Auth Hook

```javascript
import { useAuthExtended } from '../hooks/useAuthExtended';

function MyComponent() {
    const { 
        user, 
        isAuthenticated, 
        apiStatus, 
        getAuthHeader, 
        validateSession 
    } = useAuthExtended();
    
    // Use extended features
    const makeAuthenticatedRequest = async () => {
        const headers = getAuthHeader();
        // Make API call with headers
    };
}
```

## 🛠️ API Endpoints

### Required API Endpoints

Your API server should have these endpoints:

- `GET /api/health` - Health check
- `GET /api/profile` - Get user profile (protected)
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/refresh-token` - Token refresh (optional)

### Profile Endpoint Response

```json
{
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "avatar.jpg",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
}
```

## 🔍 Debugging

### Debug Panel

Visit `/debug/auth` to access the authentication debug panel:

- View current authentication status
- Test login/logout functionality
- Check API connectivity
- Validate session
- View token information

### Middleware Headers

The middleware adds debug headers to responses:

- `x-middleware-executed`: Middleware execution status
- `x-pathname`: Current path
- `x-has-token`: Token presence
- `x-is-authenticated`: Authentication status
- `x-user-id`: User ID (if authenticated)
- `x-user-email`: User email (if authenticated)

## 🔒 Security Features

### Token Verification

- Real-time API validation instead of local JWT verification
- Automatic token cleanup on expiration
- Secure cookie handling

### Route Protection

- Automatic redirection for unauthenticated users
- Protected routes configuration
- Public routes whitelist

### Error Handling

- API connection failure handling
- Token expiration management
- User-friendly error messages

## 📝 Usage Examples

### Login Flow

```javascript
import { login } from '../services/auth-service';

const handleLogin = async (email, password) => {
    const result = await login({ email, password });
    
    if (result.status === 200) {
        // Login successful, user data automatically stored
        router.push('/dashboard');
    } else {
        // Handle login error
        setError(result.message);
    }
};
```

### Protected Route

```javascript
import ProtectedRoute from '../components/auth/ProtectedRoute';

function ProtectedPage() {
    return (
        <ProtectedRoute>
            <div>This content is only visible to authenticated users</div>
        </ProtectedRoute>
    );
}
```

### Manual API Call

```javascript
import { getRequest } from '../lib/api-client';

const fetchUserData = async () => {
    try {
        const response = await getRequest('/api/user/profile');
        setUserData(response.data);
    } catch (error) {
        // Error handling (automatic logout on 401)
        console.error('Failed to fetch user data:', error);
    }
};
```

## ⚡ Performance Considerations

- **Caching**: User data cached in localStorage and context
- **Lazy Loading**: Components loaded only when needed
- **Efficient Verification**: API calls optimized with timeouts
- **Background Refresh**: Token refresh happens in background

## 🐛 Troubleshooting

### Common Issues

1. **API Server Not Running**: Ensure API server is running on correct port
2. **CORS Issues**: Check CORS configuration in API server
3. **Token Expiration**: Implement refresh token mechanism
4. **Environment Variables**: Verify all required env vars are set

### Debug Commands

```bash
# Test API connectivity
curl http://localhost:3033/api/health

# Test profile endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3033/api/profile

# Run test script
./test-auth-setup.sh
```

## 🚀 Deployment

### Production Considerations

1. Update API_BASE_URL for production
2. Use secure JWT secrets
3. Enable HTTPS
4. Configure proper CORS settings
5. Set up proper error logging

### Environment Variables for Production

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/
API_BASE_URL=https://your-api-domain.com/
JWT_SECRET=your-super-secure-jwt-secret
```

## 📞 Support

যদি কোন সমস্যা হয় বা additional features চান, তাহলে যোগাযোগ করুন।

Happy coding! 🎉
