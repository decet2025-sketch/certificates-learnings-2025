import { z } from 'zod';

// Common validation patterns
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /[A-Z]/,
    'Password must contain at least one uppercase letter'
  )
  .regex(
    /[a-z]/,
    'Password must contain at least one lowercase letter'
  )
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character'
  );

const urlSchema = z
  .string()
  .min(1, 'URL is required')
  .refine((url) => {
    // Allow URLs with or without protocol
    const urlWithProtocol =
      url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `https://${url}`;

    try {
      new URL(urlWithProtocol);
      return true;
    } catch {
      return false;
    }
  }, 'Please enter a valid URL');

const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .regex(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number');

// Course validation schemas
export const createCourseSchema = z.object({
  name: z
    .string()
    .min(1, 'Course name is required')
    .min(3, 'Course name must be at least 3 characters')
    .max(100, 'Course name must be less than 100 characters'),
  courseUrl: z.string().min(1, 'Course URL is required'),
  certificateTemplate: z
    .string()
    .min(1, 'Certificate template HTML is required')
    .min(10, 'Certificate template must be at least 10 characters')
    .refine((html) => {
      // Basic HTML validation - check for HTML tags
      return html.includes('<') && html.includes('>');
    }, 'Certificate template must contain valid HTML'),
});

export const updateCourseSchema = createCourseSchema.partial();

// Learner validation schemas
export const createLearnerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  organization: z
    .string()
    .min(1, 'Organization is required')
    .min(2, 'Organization must be at least 2 characters')
    .max(100, 'Organization must be less than 100 characters'),
  organizationId: z.string().min(1, 'Organization ID is required'),
  status: z.enum(['active', 'inactive', 'suspended']),
});

export const updateLearnerSchema = createLearnerSchema.partial();

export const uploadLearnersSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.type === 'text/csv',
      'File must be a CSV file'
    )
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      'File size must be less than 5MB'
    ),
});

// Organization validation schemas
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters'),
  website: z.string().min(1, 'Website is required'),
  sopEmail: emailSchema,
  sopPassword: passwordSchema,
});

export const updateOrganizationSchema =
  createOrganizationSchema.partial();

// Authentication validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
    role: z.enum(['admin', 'sop']),
    organizationId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Certificate validation schemas
export const generateCertificateSchema = z.object({
  learnerId: z.string().min(1, 'Learner ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  learnerName: z
    .string()
    .min(1, 'Learner name is required')
    .min(2, 'Learner name must be at least 2 characters'),
  courseName: z
    .string()
    .min(1, 'Course name is required')
    .min(2, 'Course name must be at least 2 characters'),
  organizationName: z
    .string()
    .min(1, 'Organization name is required')
    .min(2, 'Organization name must be at least 2 characters'),
});

// Filter validation schemas
export const filterSchema = z.object({
  search: z.string().optional(),
  organization: z.string().optional(),
  course: z.string().optional(),
  completionStatus: z.array(z.string()).optional(),
  certificateStatus: z.array(z.string()).optional(),
  dateRange: z
    .object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
    .optional(),
});

// Pagination validation schemas
export const paginationSchema = z.object({
  currentPage: z.number().min(1, 'Current page must be at least 1'),
  itemsPerPage: z
    .number()
    .min(1, 'Items per page must be at least 1')
    .max(100, 'Items per page must be less than 100'),
  totalItems: z.number().min(0, 'Total items cannot be negative'),
});

// UI validation schemas
export const notificationSchema = z.object({
  type: z.enum(['success', 'error', 'warning', 'info']),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(500, 'Message must be less than 500 characters'),
});

// Export types
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateLearnerInput = z.infer<typeof createLearnerSchema>;
export type UpdateLearnerInput = z.infer<typeof updateLearnerSchema>;
export type UploadLearnersInput = z.infer<
  typeof uploadLearnersSchema
>;
export type CreateOrganizationInput = z.infer<
  typeof createOrganizationSchema
>;
export type UpdateOrganizationInput = z.infer<
  typeof updateOrganizationSchema
>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type GenerateCertificateInput = z.infer<
  typeof generateCertificateSchema
>;
export type FilterInput = z.infer<typeof filterSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type NotificationInput = z.infer<typeof notificationSchema>;

// Validation helper functions
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; errors?: z.ZodError } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
};

export const getFieldError = (
  errors: z.ZodError | undefined,
  fieldName: string
): string | undefined => {
  if (!errors) return undefined;

  const fieldError = errors.issues.find((issue) =>
    issue.path.includes(fieldName)
  );
  return fieldError?.message;
};

export const getFormErrors = (
  errors: z.ZodError | undefined
): Record<string, string> => {
  if (!errors) return {};

  const formErrors: Record<string, string> = {};
  errors.issues.forEach((issue) => {
    const fieldName = issue.path.join('.');
    formErrors[fieldName] = issue.message;
  });

  return formErrors;
};
