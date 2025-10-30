'use client'

import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'
import Link from 'next/link'

function ErrorContent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg p-8 space-y-6 modern-shadow-lg text-center">
        <Terminal className="h-12 w-12 text-destructive mx-auto" />
        <Alert variant="destructive">
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            An error occurred during authentication. Please try again.
          </AlertDescription>
        </Alert>
        <Link href="/auth/signin">
          <Button className="w-full h-11 text-lg font-semibold rounded-xl hover-lift modern-shadow-lg">
            Retry Sign In
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <p className="text-xl text-gray-700">Loading...</p>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
