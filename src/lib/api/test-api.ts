// Simple API test utility
import { courseApi, organizationApi } from './admin-api'

export const testApiConnection = async () => {
  console.log('Testing API connection...')
  
  try {
    // Test courses API
    console.log('Testing courses API...')
    const coursesResponse = await courseApi.listCourses(10, 0)
    console.log('Courses API response:', coursesResponse)
    
    // Test organizations API
    console.log('Testing organizations API...')
    const orgsResponse = await organizationApi.listOrganizations(10, 0)
    console.log('Organizations API response:', orgsResponse)
    
    console.log('API connection test completed successfully!')
    return true
  } catch (error) {
    console.error('API connection test failed:', error)
    return false
  }
}

// Export for use in browser console or debugging
if (typeof window !== 'undefined') {
  (window as any).testApiConnection = testApiConnection
}
