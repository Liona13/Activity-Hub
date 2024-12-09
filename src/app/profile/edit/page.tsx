'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { toast } from "@/components/ui/use-toast";

interface ProfileFormData {
  bio: string;
  location: string;
  interests: string[];
}

interface ApiError {
  error: string;
  details?: Array<{ path: string; message: string }>;
}

export default function EditProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    bio: '',
    location: '',
    interests: [],
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Fetch current profile data
    fetch('/api/users/profile')
      .then(async (res) => {
        if (!res.ok) {
          const errorData: ApiError = await res.json();
          throw new Error(errorData.error || 'Failed to load profile data');
        }
        return res.json();
      })
      .then(data => {
        setFormData({
          bio: data.bio || '',
          location: data.location || '',
          interests: data.interests || [],
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        setError(error.message || 'Failed to load profile data');
        setLoading(false);
      });
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ApiError;
        if (errorData.details) {
          throw new Error(
            errorData.details.map(d => `${d.path}: ${d.message}`).join(', ')
          );
        }
        throw new Error(errorData.error || 'Failed to update profile');
      }

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });

      router.push('/profile');
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInterestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const interests = e.target.value.split(',').map(i => i.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, interests }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: 'Profile', href: '/profile' },
              { label: 'Edit Profile' }
            ]}
          />
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Profile</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Update your profile information</p>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 p-4 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <div className="mt-1">
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md"
                    value={formData.bio || ''}
                    onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Brief description for your profile.
                </p>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="location"
                    id="location"
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md"
                    value={formData.location || ''}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                  Interests
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="interests"
                    id="interests"
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md"
                    value={formData.interests.join(', ')}
                    onChange={handleInterestChange}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Separate interests with commas (e.g., "hiking, reading, photography")
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/profile')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 