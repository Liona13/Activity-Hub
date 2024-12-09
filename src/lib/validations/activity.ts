import { z } from 'zod';

const dateSchema = z.preprocess((arg) => {
  if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
  return arg;
}, z.date());

export const activityFormSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be less than 100 characters'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(5000, 'Description must be less than 5000 characters'),
    startDate: dateSchema
      .refine((date) => date > new Date(), {
        message: 'Start date must be in the future',
      }),
    endDate: dateSchema,
    location: z
      .string()
      .min(3, 'Location must be at least 3 characters')
      .max(200, 'Location must be less than 200 characters'),
    maxParticipants: z
      .number()
      .int()
      .min(1, 'Must have at least 1 participant')
      .max(1000, 'Cannot have more than 1000 participants'),
    categoryId: z
      .string()
      .min(1, 'Please select a category'),
    isPrivate: z
      .boolean()
      .default(false),
    isPaid: z
      .boolean()
      .default(false),
    price: z
      .number()
      .min(0, 'Price cannot be negative')
      .optional()
      .nullable(),
    images: z
      .array(z.string())
      .max(5, 'Cannot upload more than 5 images')
      .optional()
      .default([]),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  })
  .refine((data) => !data.isPaid || (data.isPaid && data.price && data.price > 0), {
    message: 'Price is required for paid activities',
    path: ['price'],
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type ActivityFormData = z.infer<typeof activityFormSchema>; 