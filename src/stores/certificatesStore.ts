import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Certificate, CertificatesStore } from '@/types/store'

// Mock API functions (replace with real API calls)
const mockCertificates: Certificate[] = [
  {
    id: '1',
    learnerId: '1',
    courseId: '1',
    learnerName: 'John Doe',
    courseName: 'Advanced React Development',
    organizationName: 'Acme Corp',
    issuedDate: '2024-02-20T00:00:00Z',
    status: 'issued',
    downloadUrl: '/certificates/cert-2024-001.pdf',
    certificateId: 'CERT-2024-001'
  },
  {
    id: '2',
    learnerId: '2',
    courseId: '2',
    learnerName: 'Jane Smith',
    courseName: 'JavaScript Fundamentals',
    organizationName: 'TechCorp Inc',
    issuedDate: '2024-02-18T00:00:00Z',
    status: 'pending',
    certificateId: 'CERT-2024-002'
  },
  {
    id: '3',
    learnerId: '3',
    courseId: '3',
    learnerName: 'Mike Johnson',
    courseName: 'Node.js Backend Development',
    organizationName: 'StartupIO',
    issuedDate: '2024-02-21T00:00:00Z',
    status: 'issued',
    downloadUrl: '/certificates/cert-2024-003.pdf',
    certificateId: 'CERT-2024-003'
  }
]

const fetchCertificatesFromAPI = async (): Promise<Certificate[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  return mockCertificates
}

const generateCertificateAPI = async (learnerId: string, courseId: string): Promise<Certificate> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const newCertificate: Certificate = {
    id: Date.now().toString(),
    learnerId,
    courseId,
    learnerName: 'Generated Learner',
    courseName: 'Generated Course',
    organizationName: 'Generated Organization',
    issuedDate: new Date().toISOString(),
    status: 'issued',
    downloadUrl: `/certificates/cert-${Date.now()}.pdf`,
    certificateId: `CERT-${Date.now()}`
  }
  
  return newCertificate
}

const downloadCertificateAPI = async (certificateId: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // In a real implementation, this would trigger a file download
  console.log(`Downloading certificate: ${certificateId}`)
}

export const useCertificatesStore = create<CertificatesStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        certificates: [],
        selectedCertificate: null,
        isLoading: false,
        error: null,
        totalCount: 0,

        // Actions
        setCertificates: (certificates) => {
          set({ certificates, totalCount: certificates.length }, false, 'setCertificates')
        },

        addCertificate: (certificate) => {
          const { certificates } = get()
          set({ 
            certificates: [...certificates, certificate], 
            totalCount: certificates.length + 1 
          }, false, 'addCertificate')
        },

        updateCertificate: (id, updates) => {
          const { certificates } = get()
          const updatedCertificates = certificates.map(cert =>
            cert.id === id ? { ...cert, ...updates } : cert
          )
          set({ certificates: updatedCertificates }, false, 'updateCertificate')
        },

        deleteCertificate: (id) => {
          const { certificates } = get()
          const filteredCertificates = certificates.filter(cert => cert.id !== id)
          set({ 
            certificates: filteredCertificates, 
            totalCount: filteredCertificates.length 
          }, false, 'deleteCertificate')
        },

        setSelectedCertificate: (certificate) => {
          set({ selectedCertificate: certificate }, false, 'setSelectedCertificate')
        },

        setLoading: (loading) => {
          set({ isLoading: loading }, false, 'setLoading')
        },

        setError: (error) => {
          set({ error }, false, 'setError')
        },

        fetchCertificates: async () => {
          set({ isLoading: true, error: null }, false, 'fetchCertificates/start')
          
          try {
            const certificates = await fetchCertificatesFromAPI()
            set({ 
              certificates, 
              totalCount: certificates.length, 
              isLoading: false 
            }, false, 'fetchCertificates/success')
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch certificates',
              isLoading: false 
            }, false, 'fetchCertificates/error')
          }
        },

        generateCertificate: async (learnerId, courseId) => {
          set({ isLoading: true, error: null }, false, 'generateCertificate/start')
          
          try {
            const newCertificate = await generateCertificateAPI(learnerId, courseId)
            const { certificates } = get()
            set({ 
              certificates: [...certificates, newCertificate], 
              totalCount: certificates.length + 1,
              isLoading: false 
            }, false, 'generateCertificate/success')
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to generate certificate',
              isLoading: false 
            }, false, 'generateCertificate/error')
          }
        },

        downloadCertificate: async (certificateId) => {
          set({ isLoading: true, error: null }, false, 'downloadCertificate/start')
          
          try {
            await downloadCertificateAPI(certificateId)
            set({ isLoading: false }, false, 'downloadCertificate/success')
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to download certificate',
              isLoading: false 
            }, false, 'downloadCertificate/error')
          }
        }
      }),
      {
        name: 'certificates-storage',
        partialize: (state) => ({ 
          certificates: state.certificates,
          selectedCertificate: state.selectedCertificate,
          totalCount: state.totalCount
        })
      }
    ),
    {
      name: 'certificates-store'
    }
  )
)
