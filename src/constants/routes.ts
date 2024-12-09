export const ROUTES = {
  HOME: '/',
  AUTH: {
    SIGNIN: '/auth/signin',
    ERROR: '/auth/error',
    NEW_USER: '/auth/new-user',
  },
  ACTIVITIES: {
    LIST: '/activities',
    CREATE: '/activities/create',
    DETAIL: (id: string) => `/activities/${id}`,
    EDIT: (id: string) => `/activities/${id}/edit`,
  },
  PROFILE: {
    VIEW: '/profile',
    EDIT: '/profile/edit',
  },
  API: {
    ACTIVITIES: {
      LIST: '/api/activities',
      CREATE: '/api/activities',
      DETAIL: (id: string) => `/api/activities/${id}`,
      JOIN: (id: string) => `/api/activities/${id}/join`,
    },
    CATEGORIES: '/api/categories',
    PROFILE: '/api/users/profile',
  },
} as const; 