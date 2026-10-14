'use client';

import { ApiResponse } from '../../../types/ApiResponse';
import { useEffect, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function FinishOnboarding() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debouncedUsername] = useDebounceValue(username, 300);

  // Redirect if user already has a username or isn't logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/sign-in');
    }
    if (status === 'authenticated' && session?.user?.username) {
      router.replace('/dashboard');
    }
  }, [status, session, router]);

  // Check username uniqueness (reuses existing API)
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (debouncedUsername?.trim()) {
        setIsCheckingUsername(true);
        setUsernameMessage('');
        try {
          const response = await axios.get<ApiResponse>(
            `/api/check-unique-username?username=${debouncedUsername}`
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? 'Error checking username'
          );
        } finally {
          setIsCheckingUsername(false);
        }
      } else {
        setUsernameMessage('');
      }
    };
    checkUsernameUnique();
  }, [debouncedUsername]);

  const handleSubmit = async () => {
    if (!username.trim() || usernameMessage !== 'username is unique') return;

    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>('/api/set-username', {
        username,
      });

      if (response.data.success) {
        // Update the NextAuth session with the new username
        await update({ username });

        toast({
          title: 'Welcome!',
          description: 'Your username has been set successfully.',
        });

        router.replace('/dashboard');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ?? 'Failed to set username',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-800">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Almost there!
          </h1>
          <p className="text-gray-600">
            Choose a unique username to complete your account setup.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <Input
              id="username"
              placeholder="Enter a unique username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {isCheckingUsername && (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-500">Checking...</span>
              </div>
            )}
            {!isCheckingUsername && usernameMessage && (
              <p
                className={`text-sm mt-2 ${
                  usernameMessage === 'username is unique'
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {usernameMessage}
              </p>
            )}
          </div>

          <Button
            className="w-full"
            disabled={
              isSubmitting ||
              isCheckingUsername ||
              !username.trim() ||
              usernameMessage !== 'username is unique'
            }
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
