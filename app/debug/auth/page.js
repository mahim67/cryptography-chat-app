import { AuthProvider } from '@/contexts/AuthContext';
import AuthDebugPanel from '@/components/auth/AuthDebugPanel';

export default function AuthDebugPage() {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-background">
                <AuthDebugPanel />
            </div>
        </AuthProvider>
    );
}

export const metadata = {
    title: 'Auth Debug - Cryptography Chat',
    description: 'Authentication debugging panel',
};
