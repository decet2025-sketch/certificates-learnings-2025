'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, ArrowLeft, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function UnauthorizedPage() {
  const { logout } = useAuthStore()
  const router = useRouter()

  const handleGoHome = () => {
    router.push('/')
  }

  const handleLogout = () => {
    logout()
    localStorage.removeItem('user')
    router.push('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md glass-card border-white/20 shadow-lg modern-shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Access Denied</CardTitle>
          <CardDescription className="text-gray-600">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleGoHome}
              className="w-full h-11 text-lg font-semibold rounded-xl hover-lift modern-shadow-lg border-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full h-11 text-lg font-semibold rounded-xl hover-lift glass-card border-red-200/50 text-red-600 hover:bg-red-50 hover:border-red-300 hover:shadow-lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
