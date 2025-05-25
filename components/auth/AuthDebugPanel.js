'use client';

import { useState, useEffect } from 'react';
import { useAuthExtended } from '../../hooks/useAuthExtended';
import { login, logout, getCurrentUser } from '../../services/auth-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';

export default function AuthDebugPanel() {
    const {
        user,
        isAuthenticated,
        loading,
        apiStatus,
        checkApiConnection,
        getAuthHeader,
        validateSession,
        token,
        hasValidToken
    } = useAuthExtended();

    const [testCredentials, setTestCredentials] = useState({
        email: 'test@example.com',
        password: 'password123'
    });

    const [testResults, setTestResults] = useState({});
    const [testing, setTesting] = useState(false);

    // Test login functionality
    const testLogin = async () => {
        setTesting(true);
        try {
            const result = await login(testCredentials);
            setTestResults(prev => ({
                ...prev,
                login: {
                    success: result.status === 200,
                    data: result.data,
                    message: result.message || 'Login attempt completed'
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                login: {
                    success: false,
                    error: error.message
                }
            }));
        } finally {
            setTesting(false);
        }
    };

    // Test profile fetch
    const testProfile = async () => {
        setTesting(true);
        try {
            const result = await getCurrentUser();
            setTestResults(prev => ({
                ...prev,
                profile: {
                    success: result.success,
                    data: result.data,
                    message: result.message || 'Profile fetch completed'
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                profile: {
                    success: false,
                    error: error.message
                }
            }));
        } finally {
            setTesting(false);
        }
    };

    // Test logout
    const testLogout = async () => {
        setTesting(true);
        try {
            await logout();
            setTestResults(prev => ({
                ...prev,
                logout: {
                    success: true,
                    message: 'Logout completed'
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                logout: {
                    success: false,
                    error: error.message
                }
            }));
        } finally {
            setTesting(false);
        }
    };

    // Clear test results
    const clearResults = () => {
        setTestResults({});
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        🔐 Authentication Debug Panel
                        <Badge variant={isAuthenticated ? "default" : "secondary"}>
                            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Test and debug authentication middleware functionality
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Current Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Current Status</Label>
                            <div className="space-y-1 text-sm">
                                <div>Loading: <Badge variant="outline">{loading ? "Yes" : "No"}</Badge></div>
                                <div>Has Valid Token: <Badge variant="outline">{hasValidToken ? "Yes" : "No"}</Badge></div>
                                <div>API Connected: 
                                    <Badge variant={apiStatus.connected ? "default" : "destructive"}>
                                        {apiStatus.checking ? "Checking..." : apiStatus.connected ? "Yes" : "No"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">User Info</Label>
                            <div className="text-sm">
                                {user ? (
                                    <div className="space-y-1">
                                        <div>ID: {user.id}</div>
                                        <div>Email: {user.email}</div>
                                        <div>Name: {user.name}</div>
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground">No user data</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Token Info */}
                    {token && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Token Info</Label>
                            <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                                {token.substring(0, 50)}...
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Test Controls */}
            <Card>
                <CardHeader>
                    <CardTitle>Test Authentication Flow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Test Credentials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="test-email">Test Email</Label>
                            <Input
                                id="test-email"
                                type="email"
                                value={testCredentials.email}
                                onChange={(e) => setTestCredentials(prev => ({
                                    ...prev,
                                    email: e.target.value
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="test-password">Test Password</Label>
                            <Input
                                id="test-password"
                                type="password"
                                value={testCredentials.password}
                                onChange={(e) => setTestCredentials(prev => ({
                                    ...prev,
                                    password: e.target.value
                                }))}
                            />
                        </div>
                    </div>

                    {/* Test Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <Button 
                            onClick={testLogin} 
                            disabled={testing}
                            variant="default"
                        >
                            Test Login
                        </Button>
                        <Button 
                            onClick={testProfile} 
                            disabled={testing}
                            variant="outline"
                        >
                            Test Profile Fetch
                        </Button>
                        <Button 
                            onClick={testLogout} 
                            disabled={testing}
                            variant="outline"
                        >
                            Test Logout
                        </Button>
                        <Button 
                            onClick={checkApiConnection} 
                            disabled={testing}
                            variant="outline"
                        >
                            Check API Connection
                        </Button>
                        <Button 
                            onClick={validateSession} 
                            disabled={testing}
                            variant="outline"
                        >
                            Validate Session
                        </Button>
                        <Button 
                            onClick={clearResults} 
                            variant="ghost"
                        >
                            Clear Results
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Test Results */}
            {Object.keys(testResults).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(testResults).map(([test, result]) => (
                                <div key={test} className="border rounded p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium capitalize">{test}</span>
                                        <Badge variant={result.success ? "default" : "destructive"}>
                                            {result.success ? "Success" : "Failed"}
                                        </Badge>
                                    </div>
                                    {result.message && (
                                        <div className="text-sm text-muted-foreground mb-2">
                                            {result.message}
                                        </div>
                                    )}
                                    {result.error && (
                                        <div className="text-sm text-red-600 mb-2">
                                            Error: {result.error}
                                        </div>
                                    )}
                                    {result.data && (
                                        <div className="text-xs font-mono bg-muted p-2 rounded">
                                            {JSON.stringify(result.data, null, 2)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
