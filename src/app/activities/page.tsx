'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Calendar, Filter, MapPin, Search, Users } from 'lucide-react';
import { formatDate, getRelativeTimeString } from '@/utils/date';

interface Activity {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Category {
  id: string;
  name: string;
}

interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
}

function ActivitySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const DEFAULT_SORT = {
  orderBy: 'startDate' as const,
  orderDirection: 'asc' as const
};

export default function ActivitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('orderBy') || DEFAULT_SORT.orderBy);
  const [sortOrder, setSortOrder] = useState(searchParams.get('orderDirection') || DEFAULT_SORT.orderDirection);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(error => {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      });
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);

      // Construct query string
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.set('search', searchTerm);
      if (selectedCategory) queryParams.set('category', selectedCategory);
      if (statusFilter) queryParams.set('status', statusFilter);
      if (dateFilter) queryParams.set('date', dateFilter);
      queryParams.set('orderBy', sortBy);
      queryParams.set('orderDirection', sortOrder);
      queryParams.set('page', page.toString());
      queryParams.set('limit', '9'); // Show 9 items per page for grid layout

      try {
        const response = await fetch(`/api/activities?${queryParams.toString()}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch activities');
        }
        const data = await response.json();
        setActivities(data.activities);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError(error instanceof Error ? error.message : 'Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [searchTerm, selectedCategory, statusFilter, dateFilter, sortBy, sortOrder, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    
    const params = new URLSearchParams(searchParams);
    if (searchTerm) params.set('search', searchTerm);
    else params.delete('search');
    params.set('page', '1');
    
    router.push(`/activities?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    setPage(1); // Reset to first page on filter change
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    router.push(`/activities?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [typeof sortBy, typeof sortOrder];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    handleFilterChange('orderBy', newSortBy);
    handleFilterChange('orderDirection', newSortOrder);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <Breadcrumb items={[{ label: 'Activities' }]} />
            <Button asChild>
              <Link href="/activities/create">Create Activity</Link>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={selectedCategory}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={dateFilter}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                  >
                    <option value="">Any Time</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="startDate-asc">Date (Earliest)</option>
                    <option value="startDate-desc">Date (Latest)</option>
                    <option value="createdAt-desc">Recently Added</option>
                    <option value="title-asc">Title (A-Z)</option>
                    <option value="title-desc">Title (Z-A)</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <ActivitySkeleton />
        ) : activities.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/activities/${activity.id}`}
                  className="group bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {/* Activity image or placeholder */}
                  <div className="relative h-48 bg-gray-100">
                    {activity.images?.[0] ? (
                      <img
                        src={activity.images[0]}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Calendar className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-800'
                          : activity.status === 'ongoing'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors duration-200">
                      {activity.title}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {activity.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{activity.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{getRelativeTimeString(activity.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{activity.currentParticipants} / {activity.maxParticipants} participants</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        {activity.creator.image ? (
                          <img
                            src={activity.creator.image}
                            alt={activity.creator.name || ''}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gray-200" />
                        )}
                        <span className="text-sm text-gray-600">
                          {activity.creator.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                        {activity.category.name}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === pagination.totalPages)
                    .map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i > 0 && arr[i - 1] !== p - 1 && (
                          <span className="px-2">...</span>
                        )}
                        <Button
                          variant={p === page ? 'default' : 'outline'}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      </React.Fragment>
                    ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Filter className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No activities found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setStatusFilter('');
                setDateFilter('');
                setSortBy('startDate');
                setSortOrder('asc');
                setPage(1);
                router.push('/activities');
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 