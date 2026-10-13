'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios, { AxiosError } from 'axios';
import { Loader2, KeyRound, AlertCircle } from 'lucide-react';

import { resetPasswordSchema } from '@/src/schema/ResetPassword.schema';
import { ApiResponse } from '@/src/types/ApiResponse';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

function ResetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    if (!token) {
      toast({
        title: 'Error',
        description: 'Reset token is missing.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>('/api/reset-password', {
        token,
        password: data.password,
      });

      toast({
        title: 'Password Reset Successful',
        description: response.data.message || 'You can now sign in with your new password.',
      });

      router.replace('/sign-in');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Reset Failed',
        description:
          axiosError.response?.data.message ||
          'Failed to reset password. The link may have expired.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Invalid Reset Link</h2>
        <p className="text-sm text-gray-600">
          This password reset link is invalid or incomplete. Please request a new one.
        </p>
        <Button
          onClick={() => router.push('/forgot-password')}
          className="w-full"
        >
          Request New Link
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="text-center">
        <div className="flex justify-center mb-2">
          <KeyRound className="h-10 w-10 text-gray-800" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl mb-2 text-gray-900">
          Reset Password
        </h1>
        <p className="text-gray-600 text-sm">
          Please enter your new password below.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="confirmPassword"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Repeat new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <Suspense
          fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <div className="text-center pt-2">
          <Link
            href="/sign-in"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Remember your password? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
