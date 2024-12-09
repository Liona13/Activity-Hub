import { ROUTES } from '@/constants/routes';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  activities: {
    list: (params?: URLSearchParams) => 
      fetchApi(`${ROUTES.API.ACTIVITIES.LIST}${params ? `?${params}` : ''}`),
    create: (data: any) => 
      fetchApi(ROUTES.API.ACTIVITIES.CREATE, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (id: string) => 
      fetchApi(ROUTES.API.ACTIVITIES.DETAIL(id)),
    join: (id: string) => 
      fetchApi(ROUTES.API.ACTIVITIES.JOIN(id), {
        method: 'POST',
      }),
    comments: {
      list: (activityId: string) => 
        fetchApi(`/api/activities/${activityId}/comments`),
      create: (activityId: string, data: { content: string; parentId?: string }) => 
        fetchApi(`/api/activities/${activityId}/comments`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (commentId: string, data: { content: string }) => 
        fetchApi(`/api/comments/${commentId}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      delete: (commentId: string) => 
        fetchApi(`/api/comments/${commentId}`, {
          method: 'DELETE',
        }),
    },
  },
  categories: {
    list: () => fetchApi(ROUTES.API.CATEGORIES),
  },
  profile: {
    get: () => fetchApi(ROUTES.API.PROFILE),
    update: (data: any) => 
      fetchApi(ROUTES.API.PROFILE, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
}; 