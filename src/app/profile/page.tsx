'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface UserProfile {
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  location: string | null;
  interests: string[];
  createdActivities: Activity[];
  participations: Participation[];
}

interface Activity {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: {
    name: string;
  };
}

interface Participation {
  activity: Activity;
  status: string;
}

function ProfileImage({ src, name }: { src: string | null, name: string }) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
        <span className="text-4xl text-gray-500">
          {name?.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={128}
      height={128}
      className="rounded-full"
      onError={() => setImageError(true)}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Profile Header Skeleton */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-4 w-full max-w-sm" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-6 w-16" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Tabs Skeleton */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <div className="flex">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'created' | 'participating'>('created');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user?.isNewUser) {
      router.push('/auth/new-user');
      return;
    }

    // Fetch user profile
    fetch('/api/users/profile')
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        setLoading(false);
      });
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Error loading profile</h3>
          <p className="mt-1 text-sm text-gray-500">Please try refreshing the page</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: 'Profile' }
            ]}
          />
        </div>

        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex-shrink-0">
                <ProfileImage src={profile.image} name={profile.name} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                  <Button asChild>
                    <Link href="/profile/edit">Edit Profile</Link>
                  </Button>
                </div>
                
                <div className="mt-4 space-y-3">
                  {profile.location && (
                    <p className="text-sm text-gray-600">
                      📍 {profile.location}
                    </p>
                  )}
                  
                  {profile.bio && (
                    <p className="text-sm text-gray-600">
                      {profile.bio}
                    </p>
                  )}
                  
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('created')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'created'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Created Activities ({profile.createdActivities.length})
              </button>
              <button
                onClick={() => setActiveTab('participating')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'participating'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Participating ({profile.participations.length})
              </button>
            </nav>
          </div>

          <div className="p-4">
            {activeTab === 'created' ? (
              profile.createdActivities.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {profile.createdActivities.map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/activities/${activity.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900">{activity.title}</h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{activity.description}</p>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>📍 {activity.location}</p>
                          <p>🗓 {formatDate(activity.startDate)}</p>
                          <p className="text-xs mt-1 text-gray-400">{activity.category.name}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  You haven't created any activities yet.{' '}
                  <Link href="/activities/create" className="text-primary hover:text-primary/90">
                    Create one now!
                  </Link>
                </p>
              )
            ) : (
              profile.participations.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {profile.participations.map((participation) => (
                    <Link
                      key={participation.activity.id}
                      href={`/activities/${participation.activity.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium text-gray-900">{participation.activity.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            participation.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {participation.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{participation.activity.description}</p>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>📍 {participation.activity.location}</p>
                          <p>🗓 {formatDate(participation.activity.startDate)}</p>
                          <p className="text-xs mt-1 text-gray-400">{participation.activity.category.name}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  You're not participating in any activities yet.{' '}
                  <Link href="/" className="text-primary hover:text-primary/90">
                    Find activities to join!
                  </Link>
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 