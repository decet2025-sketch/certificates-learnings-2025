import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Course, CoursesStore } from '@/types/store';
import {
  courseApi,
  handleApiError,
  adminApi,
} from '@/lib/api/admin-api';
import { CourseApi } from '@/types/api';

// Helper function to transform API course to store course
const transformApiCourseToStore = (apiCourse: CourseApi): Course => {
  return {
    id: apiCourse.id,
    name: apiCourse.name,
    courseId: apiCourse.course_id,
    courseUrl: apiCourse.course_url,
    certificateTemplate: apiCourse.certificate_template_html,
    status: 'active', // Default status since API doesn't provide this
    totalLearners: 0, // Will be updated when learners are loaded
    completedLearners: 0, // Will be updated when learners are loaded
  };
};

// Helper function to transform store course to API course
const transformStoreCourseToApi = (
  storeCourse: Omit<Course, 'id'>
) => {
  return {
    course_url: storeCourse.courseUrl || '',
    name: storeCourse.name,
    certificate_template_html:
      typeof storeCourse.certificateTemplate === 'string'
        ? storeCourse.certificateTemplate
        : '',
  };
};

export const useCoursesStore = create<CoursesStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        courses: [],
        selectedCourse: null,
        isLoading: false,
        error: null,
        totalCount: 0,
        pagination: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 0,
          hasMore: false,
        },
        searchTerm: '',

        // Actions
        setCourses: (courses) => {
          set(
            { courses, totalCount: courses.length },
            false,
            'setCourses'
          );
        },

        addCourse: (course) => {
          const { courses } = get();
          console.log(
            'Courses before update:',
            courses.map((c) => ({
              id: c.id,
              courseId: c.courseId,
              name: c.name,
            }))
          );
          set(
            {
              courses: [...courses, course],
              totalCount: courses.length + 1,
            },
            false,
            'addCourse'
          );
        },

        updateCourse: (id, updates) => {
          console.log(
            'Store updateCourse called with ID:',
            id,
            'Updates:',
            updates
          );
          const { courses } = get();
          console.log(
            'Courses before update:',
            courses.map((c) => ({
              id: c.id,
              courseId: c.courseId,
              name: c.name,
            }))
          );
          const updatedCourses = courses.map((course) =>
            course.courseId === id
              ? { ...course, ...updates }
              : course
          );
          set({ courses: updatedCourses }, false, 'updateCourse');
          console.log(
            'Courses after update:',
            updatedCourses.map((c) => ({
              id: c.id,
              courseId: c.courseId,
              name: c.name,
              certificateTemplate: c.certificateTemplate,
            }))
          );
        },

        deleteCourse: async (id) => {
          const { courses } = get();
          set({ isLoading: true, error: null }, false, 'deleteCourse/start');

          try {
            // Call the API to delete the course
            await adminApi.deleteCourse(id);

            // If successful, remove the course from the local state
            const filteredCourses = courses.filter(
              (course) => course.courseId !== id
            );
            set(
              {
                courses: filteredCourses,
                totalCount: filteredCourses.length,
                isLoading: false,
              },
              false,
              'deleteCourse/success'
            );
          } catch (error) {
            console.error('Failed to delete course:', error);
            const errorMessage = handleApiError(error);
            set(
              { error: errorMessage, isLoading: false },
              false,
              'deleteCourse/error'
            );
          }
        },

        setSelectedCourse: (course) => {
          set({ selectedCourse: course }, false, 'setSelectedCourse');
        },

        setLoading: (loading) => {
          set({ isLoading: loading }, false, 'setLoading');
        },

        setError: (error) => {
          set({ error }, false, 'setError');
        },

        setPagination: (pagination) => {
          const currentPagination = get().pagination;
          const newPagination = {
            ...currentPagination,
            ...pagination,
          };

          set({ pagination: newPagination }, false, 'setPagination');

          // If itemsPerPage changed, reset to page 1 and refetch
          if (
            pagination.itemsPerPage &&
            pagination.itemsPerPage !== currentPagination.itemsPerPage
          ) {
            set(
              { pagination: { ...newPagination, currentPage: 1 } },
              false,
              'resetPageForNewSize'
            );
            // Refetch with new page size
            get().fetchCourses(
              1,
              get().searchTerm,
              pagination.itemsPerPage
            );
          }
        },

        setSearchTerm: (searchTerm) => {
          set({ searchTerm }, false, 'setSearchTerm');
        },

        refreshCourses: () => {
          const { pagination, searchTerm } = get();
          get().fetchCourses(
            pagination.currentPage,
            searchTerm,
            pagination.itemsPerPage
          );
        },

        fetchCourses: async (
          page = 1,
          search = '',
          itemsPerPage?: number
        ) => {
          const currentState = get();
          const { pagination } = get();
          const limit = 100;

          // Prevent multiple simultaneous calls
          if (currentState.isLoading) {
            console.log('API call already in progress, skipping...', {
              page,
              search,
              itemsPerPage: limit,
            });
            return;
          }

          set(
            {
              isLoading: true,
              error: null,
              courses: [],
            },
            false,
            'fetchCourses/start'
          );

          try {
            const offset = (page - 1) * limit;

            console.log('Fetching courses with:', {
              limit,
              offset,
              search: search || undefined,
              currentPagination: pagination,
              itemsPerPageParam: itemsPerPage,
              pageParam: page,
            });

            const response = await adminApi.listCourses(
              limit,
              offset,
              search || undefined
            );

            const courses = response.courses.map(
              transformApiCourseToStore
            );

            // Pin courses containing specific keywords to the top
            const pinnedKeywords = ['201', '203', '204'];
            courses.sort((a, b) => {
              const aName = (a.name || '').toLowerCase();
              const bName = (b.name || '').toLowerCase();

              const isAPinned = pinnedKeywords.some(keyword => aName.includes(keyword));
              const isBPinned = pinnedKeywords.some(keyword => bName.includes(keyword));

              if (isAPinned && !isBPinned) return -1;
              if (!isAPinned && isBPinned) return 1;
              return 0;
            });

            // Use pagination object directly like learners store
            const totalItems = response.pagination?.total || 0;
            const hasMore = response.pagination?.has_more || false;

            set(
              {
                courses,
                pagination: {
                  ...pagination,
                  currentPage: page,
                  totalItems,
                  hasMore,
                },
                isLoading: false,
              },
              false,
              'fetchCourses/success'
            );
          } catch (error) {
            const errorMessage = handleApiError(error);
            set(
              {
                error: errorMessage,
                isLoading: false,
              },
              false,
              'fetchCourses/error'
            );
          }
        },

        createCourse: async (courseData) => {
          set(
            { isLoading: true, error: null },
            false,
            'createCourse/start'
          );

          try {
            const apiCourseData =
              transformStoreCourseToApi(courseData);
            const response =
              await courseApi.createCourse(apiCourseData);

            if (!response.ok) {
              throw new Error(
                response.error?.message || 'Failed to create course'
              );
            }

            const newApiCourse = response.data!;
            const newCourse = transformApiCourseToStore(newApiCourse);

            const { courses } = get();
            console.log(
              'Courses before update:',
              courses.map((c) => ({
                id: c.id,
                courseId: c.courseId,
                name: c.name,
              }))
            );
            set(
              {
                courses: [...courses, newCourse],
                totalCount: courses.length + 1,
                isLoading: false,
              },
              false,
              'createCourse/success'
            );
          } catch (error) {
            const errorMessage = handleApiError(error);
            set(
              {
                error: errorMessage,
                isLoading: false,
              },
              false,
              'createCourse/error'
            );
          }
        },
      }),
      {
        name: 'courses-storage',
        partialize: (state) => ({
          // Only persist essential user preferences, not API data or filters
          // Don't persist: searchTerm (filter should reset on page refresh)
          // Don't persist: courses, pagination, totalCount, selectedCourse
          // These should be fresh on each page load
        }),
      }
    ),
    {
      name: 'courses-store',
    }
  )
);
