'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

// API Configuration
const API_BASE_URL = 'https://cloud.appwrite.io/v1/functions';
const ADMIN_ROUTER = `${API_BASE_URL}/admin_router/executions`;

const APPWRITE_HEADERS = {
  'X-Appwrite-Project': '68cf04e30030d4b38d19',
  'X-Appwrite-Key':
    'standard_433c1d266b99746da7293cecabc52ca95bb22210e821cfd4292da0a8eadb137d36963b60dd3ecf89f7cf0461a67046c676ceacb273c60dbc1a19da1bc9042cc82e7653cb167498d8504c6abbda8634393289c3335a0cb72eb8d7972249a0b22a10f9195b0d43243116b54f34f7a15ad837a900922e23bcba34c80c5c09635142',
  'Content-Type': 'application/json',
};

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let actionData;
      if (role === 'admin') {
        actionData = {
          action: 'CREATE_ADMIN_USER',
          payload: { email, name: 'Admin User', password },
        };
      } else if (role === 'sop') {
        actionData = {
          action: 'CREATE_SOP_USER',
          payload: {
            email,
            password,
          },
        };
      } else {
        setError('Invalid role');
        setLoading(false);
        return;
      }

      // Format the request body as the API expects: {"body": "JSON_STRING"}
      const requestBody = {
        body: JSON.stringify(actionData),
      };

      console.log('Calling API with request body:', requestBody);

      const response = await fetch(ADMIN_ROUTER, {
        method: 'POST',
        headers: APPWRITE_HEADERS,
        body: JSON.stringify(requestBody),
      });

      console.log('API Response status:', response.status);
      const result = await response.json();
      console.log('API Response:', result);

      // Check if the response indicates success
      if (result.responseBody) {
        const responseBody = JSON.parse(result.responseBody);
        console.log('Parsed response body:', responseBody);

        if (responseBody.ok) {
          console.log(
            'Authentication successful, storing user data...'
          );

          // Use the auth store to set user data
          const userData = {
            id: responseBody.data?.user_id || '1',
            email: responseBody.data?.email || email,
            name: responseBody.data?.name || 'User',
            role: role as 'admin' | 'sop',
            apiToken: responseBody.data?.token || 'api-token',
            organizationWebsite:
              responseBody.data?.organization?.website ||
              responseBody.data?.organization_website ||
              '',
          };

          // Set user in auth store
          setUser(userData);

          // Redirect based on role
          if (role === 'admin') {
            router.push('/courses');
          } else if (role === 'sop') {
            router.push('/poc-dashboard/learners');
          }
        } else {
          console.log('Authentication failed:', responseBody.error);
          setError(
            responseBody.error?.message || 'Authentication failed'
          );
        }
      } else {
        console.log('Unexpected response format:', result);
        setError('Unexpected response format from server');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'An error occurred');
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg p-8 space-y-6 modern-shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900 text-gradient">
          Sign In
        </h1>
        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="role" className="text-gray-700">
              Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full mt-1 glass-card border-white/20">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="sop">POC User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-lg font-semibold rounded-xl hover-lift modern-shadow-lg"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
