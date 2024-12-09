'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Comments } from '@/components/Comments';

interface ActivityDetailProps {
  activity: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    maxParticipants: number;
    currentParticipants: number;
    status: string;
    isPrivate: boolean;
    isPaid: boolean;
    price: number | null;
    creator: {
      id: string;
      name: string;
      image: string | null;
    };
    category: {
      id: string;
      name: string;
    };
    participants: {
      user: {
        id: string;
        name: string;
        image: string | null;
      };
      status: string;
    }[];
  };
}

function ParticipantAvatar({ src, name }: { src: string | null; name: string }) {
  const [imageError, setImageError] = useState(false);
  const handleImageError = useCallback(() => setImageError(true), []);

  if (!src || imageError) {
    return (
      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
        <span className="text-sm text-gray-500">
          {name?.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={40}
      height={40}
      className="rounded-full"
      onError={handleImageError}
    />
  );
}

export default function ActivityDetailClient({ activity }: ActivityDetailProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentActivity, setCurrentActivity] = useState(activity);

  const handleJoin = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const response = await fetch(`/api/activities/${activity.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join activity');
      }

      if (data.data) {
        setCurrentActivity(data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error joining activity:', error);
      setError(error instanceof Error ? error.message : 'Failed to join activity');
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isParticipant = currentActivity.participants.some(
    p => p.user.id === session?.user?.id
  );

  const isFull = currentActivity.currentParticipants === currentActivity.maxParticipants;

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8 space-y-4">
          <Breadcrumb
            items={[
              { label: 'Activities', href: '/activities' },
              { label: currentActivity.title }
            ]}
          />
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="text-sm"
            >
              ← Back
            </Button>
            {session?.user?.id === currentActivity.creator.id && (
              <Button asChild variant="outline">
                <Link href={`/activities/${currentActivity.id}/edit`}>
                  Edit Activity
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{currentActivity.title}</h1>
                    <p className="mt-2 text-sm text-gray-500">
                      Organized by {currentActivity.creator.name}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    currentActivity.status === 'upcoming'
                      ? 'bg-blue-100 text-blue-800'
                      : currentActivity.status === 'ongoing'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentActivity.status.charAt(0).toUpperCase() + currentActivity.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="prose max-w-none">
                <p className="text-gray-600">{currentActivity.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-gray-600">
                      📍 {currentActivity.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      🗓 Starts: {formatDate(currentActivity.startDate)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ⏱ Ends: {formatDate(currentActivity.endDate)}
                    </p>
                    <p className="text-sm text-gray-600">
                      👥 {currentActivity.currentParticipants} / {currentActivity.maxParticipants} participants
                    </p>
                    {currentActivity.isPaid && (
                      <p className="text-sm text-gray-600">
                        💰 Price: ${currentActivity.price}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      🏷 Category: {currentActivity.category.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-50 p-4 rounded-md">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {session?.user?.id === currentActivity.creator.id ? (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-700">
                        You are the organizer of this activity
                      </p>
                    </div>
                  ) : isParticipant ? (
                    <div className="bg-green-50 p-4 rounded-md">
                      <p className="text-sm text-green-700">
                        You're participating in this activity!
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md space-y-3">
                      <p className="text-sm text-gray-700">
                        {isFull 
                          ? 'This activity is currently full'
                          : 'Join this activity to participate with others!'}
                      </p>
                      <Button
                        onClick={handleJoin}
                        disabled={joining || isFull}
                        className="w-full"
                      >
                        {joining ? 'Joining...' : isFull ? 'Activity Full' : 'Join Activity'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Participants */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Participants ({currentActivity.participants.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {currentActivity.participants.map((participant) => (
                    <div
                      key={participant.user.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50"
                    >
                      <ParticipantAvatar
                        src={participant.user.image}
                        name={participant.user.name}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {participant.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {participant.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Comments activityId={currentActivity.id} />
        </div>
      </div>
    </div>
  );
} 