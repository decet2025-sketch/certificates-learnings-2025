'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  handleApiErrorWithToast,
  showSuccessToast,
} from '@/lib/error-toast-handler';

// Test component to demonstrate the new error handling system
export function ErrorHandlingTest() {
  const [isLoading, setIsLoading] = useState(false);

  const testCourseExistsError = () => {
    setIsLoading(true);

    // Simulate the exact error format you mentioned
    const mockError = {
      ok: false,
      status: 409,
      error: {
        code: 'COURSE_EXISTS',
        message:
          'Course with ID 67fbd49f6fdf8b6161c9dde74 already exists',
      },
    };

    // Simulate API call that throws this error
    setTimeout(() => {
      try {
        throw new Error(JSON.stringify(mockError));
      } catch (error) {
        handleApiErrorWithToast(error, 'Test Course Creation');
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const testValidationError = () => {
    setIsLoading(true);

    const mockError = {
      ok: false,
      status: 422,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid email format provided',
      },
    };

    setTimeout(() => {
      try {
        throw new Error(JSON.stringify(mockError));
      } catch (error) {
        handleApiErrorWithToast(error, 'Test Validation');
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const testSuccessToast = () => {
    showSuccessToast(
      'Test Successful',
      'This is a test success message!'
    );
  };

  const testNetworkError = () => {
    setIsLoading(true);

    setTimeout(() => {
      try {
        throw new Error('Network connection failed');
      } catch (error) {
        handleApiErrorWithToast(error, 'Test Network Call');
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Error Handling Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Test the new error handling system with different error
          types. Check the top-right corner for toast notifications.
        </p>

        <div className="space-y-2">
          <Button
            onClick={testCourseExistsError}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? 'Testing...' : 'Test Course Exists Error'}
          </Button>

          <Button
            onClick={testValidationError}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? 'Testing...' : 'Test Validation Error'}
          </Button>

          <Button
            onClick={testNetworkError}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? 'Testing...' : 'Test Network Error'}
          </Button>

          <Button
            onClick={testSuccessToast}
            className="w-full"
            variant="default"
          >
            Test Success Toast
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
