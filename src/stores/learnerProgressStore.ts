import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { LearnerProgress, LearnerProgressStore, UIState } from '@/types/store'

// Mock API functions (replace with real API calls)
const mockLearnerProgress: LearnerProgress[] = [
  {
    id: '1',
    learnerId: '1',
    courseId: '1',
    learnerName: 'John Doe',
    email: 'john.doe@example.com',
    organization: 'Acme Corp',
    course: 'Advanced React Development',
    enrollmentDate: '2024-01-15',
    completionStatus: 'completed',
    certificateStatus: 'issued',
    progress: 100,    certificateId: 'CERT-2024-001',
    completionDate: '2024-02-20'
  },
  {
    id: '2',
    learnerId: '2',
    courseId: '2',
    learnerName: 'Jane Smith',
    email: 'jane.smith@techcorp.com',
    organization: 'TechCorp Inc',
    course: 'JavaScript Fundamentals',
    enrollmentDate: '2024-01-20',
    completionStatus: 'in-progress',
    certificateStatus: 'pending',
    progress: 65,    certificateId: 'CERT-2024-002',
    completionDate: '2024-02-18'
  },
  {
    id: '3',
    learnerId: '3',
    courseId: '3',
    learnerName: 'Mike Johnson',
    email: 'mike.johnson@startup.io',
    organization: 'StartupIO',
    course: 'Node.js Backend Development',
    enrollmentDate: '2024-01-25',
    completionStatus: 'not-started',
    certificateStatus: 'not-eligible',
    progress: 0,  }
]

const fetchLearnerProgressFromAPI = async (): Promise<LearnerProgress[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  return mockLearnerProgress
}

const filterLearnerProgress = (progress: LearnerProgress[], filters: Partial<UIState['filters']>): LearnerProgress[] => {
  return progress.filter(item => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesSearch = 
        item.learnerName.toLowerCase().includes(searchTerm) ||
        item.email.toLowerCase().includes(searchTerm) ||
        item.organization.toLowerCase().includes(searchTerm) ||
        item.course.toLowerCase().includes(searchTerm)
      
      if (!matchesSearch) return false
    }
    
    // Organization filter
    if (filters.organization && filters.organization !== 'All') {
      if (item.organization !== filters.organization) return false
    }
    
    // Course filter
    if (filters.course && filters.course !== 'All') {
      if (item.course !== filters.course) return false
    }
    
    // Completion status filter
    if (filters.completionStatus && filters.completionStatus.length > 0) {
      if (!filters.completionStatus.includes(item.completionStatus)) return false
    }
    
    // Certificate status filter
    if (filters.certificateStatus && filters.certificateStatus.length > 0) {
      if (!filters.certificateStatus.includes(item.certificateStatus)) return false
    }
    
    // Date range filter
    if (filters.dateRange?.startDate && filters.dateRange?.endDate) {
      const enrollmentDate = new Date(item.enrollmentDate)
      const startDate = new Date(filters.dateRange.startDate)
      const endDate = new Date(filters.dateRange.endDate)
      
      if (enrollmentDate < startDate || enrollmentDate > endDate) return false
    }
    
    return true
  })
}

export const useLearnerProgressStore = create<LearnerProgressStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        learnerProgress: [],
        selectedProgress: null,
        isLoading: false,
        error: null,
        totalCount: 0,
        filteredCount: 0,

        // Actions
        setLearnerProgress: (progress) => {
          set({ 
            learnerProgress: progress, 
            totalCount: progress.length,
            filteredCount: progress.length
          }, false, 'setLearnerProgress')
        },

        addLearnerProgress: (progress) => {
          const { learnerProgress } = get()
          const newProgress = [...learnerProgress, progress]
          set({ 
            learnerProgress: newProgress, 
            totalCount: newProgress.length,
            filteredCount: newProgress.length
          }, false, 'addLearnerProgress')
        },

        updateLearnerProgress: (id, updates) => {
          const { learnerProgress } = get()
          const updatedProgress = learnerProgress.map(item =>
            item.id === id ? { ...item, ...updates } : item
          )
          set({ 
            learnerProgress: updatedProgress,
            filteredCount: updatedProgress.length
          }, false, 'updateLearnerProgress')
        },

        deleteLearnerProgress: (id) => {
          const { learnerProgress } = get()
          const filteredProgress = learnerProgress.filter(item => item.id !== id)
          set({ 
            learnerProgress: filteredProgress, 
            totalCount: filteredProgress.length,
            filteredCount: filteredProgress.length
          }, false, 'deleteLearnerProgress')
        },

        setSelectedProgress: (progress) => {
          set({ selectedProgress: progress }, false, 'setSelectedProgress')
        },

        setLoading: (loading) => {
          set({ isLoading: loading }, false, 'setLoading')
        },

        setError: (error) => {
          set({ error }, false, 'setError')
        },

        fetchLearnerProgress: async () => {
          set({ isLoading: true, error: null }, false, 'fetchLearnerProgress/start')
          
          try {
            const progress = await fetchLearnerProgressFromAPI()
            set({ 
              learnerProgress: progress, 
              totalCount: progress.length,
              filteredCount: progress.length,
              isLoading: false 
            }, false, 'fetchLearnerProgress/success')
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch learner progress',
              isLoading: false 
            }, false, 'fetchLearnerProgress/error')
          }
        },

        filterLearnerProgress: (filters) => {
          const { learnerProgress } = get()
          const filtered = filterLearnerProgress(learnerProgress, filters)
          set({ 
            filteredCount: filtered.length 
          }, false, 'filterLearnerProgress')
        }
      }),
      {
        name: 'learner-progress-storage',
        partialize: (state) => ({ 
          learnerProgress: state.learnerProgress,
          selectedProgress: state.selectedProgress,
          totalCount: state.totalCount
        })
      }
    ),
    {
      name: 'learner-progress-store'
    }
  )
)
