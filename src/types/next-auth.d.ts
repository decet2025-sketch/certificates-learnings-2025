import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'admin' | 'sop' | 'student'
      organizationWebsite?: string
      apiToken?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'sop' | 'student'
    organizationWebsite?: string
    token?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'admin' | 'sop' | 'student'
    organizationWebsite?: string
    apiToken?: string
  }
}
