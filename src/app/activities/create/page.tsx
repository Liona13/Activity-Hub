'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ImageUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { LocationInput } from "@/components/ui/location-input";
import { activityFormSchema, type ActivityFormData } from '@/lib/validations/activity';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Eye } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function CreateActivity() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      location: '',
      maxParticipants: 1,
      categoryId: '',
      isPrivate: false,
      isPaid: false,
      price: null,
      images: [],
    },
  });

  const formData = watch();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Load draft from localStorage
    const draft = localStorage.getItem('activityDraft');
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      reset({
        ...parsedDraft,
        startDate: new Date(parsedDraft.startDate),
        endDate: new Date(parsedDraft.endDate),
      });
    }

    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
        setLoading(false);
      });
  }, [session, status, router, reset]);

  // Save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('activityDraft', JSON.stringify(formData));
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  const onSubmit = async (data: ActivityFormData) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create activity');
      }

      const activity = await response.json();
      localStorage.removeItem('activityDraft'); // Clear draft after successful creation
      router.push(`/activities/${activity.id}`);
    } catch (error) {
      console.error('Error creating activity:', error);
      setError('Failed to create activity. Please try again.');
    } finally {
      setSaving(false);
    }
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
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: 'Activities', href: '/activities' },
              { label: 'Create Activity' }
            ]}
          />
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Activity</h3>
                <p className="mt-1 text-sm text-gray-500">Fill in the details to create a new activity</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 p-4 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {previewMode ? (
              <div className="prose max-w-none">
                <h1>{formData.title || 'Untitled Activity'}</h1>
                <div dangerouslySetInnerHTML={{ __html: formData.description }} />
                <div className="mt-4">
                  <h3>Details</h3>
                  <ul>
                    <li>Location: {formData.location}</li>
                    <li>Start: {formData.startDate.toLocaleString()}</li>
                    <li>End: {formData.endDate.toLocaleString()}</li>
                    <li>Maximum Participants: {formData.maxParticipants}</li>
                    <li>Category: {categories.find(c => c.id === formData.categoryId)?.name}</li>
                    {formData.isPaid && <li>Price: ${formData.price}</li>}
                  </ul>
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <h3>Images</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Activity image ${index + 1}`}
                          className="rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="title"
                      {...register('title')}
                      className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message?.toString()}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <RichTextEditor
                      content={formData.description}
                      onChange={(content) => setValue('description', content)}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message?.toString()}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                    Images
                  </label>
                  <div className="mt-1">
                    <ImageUpload
                      id="images"
                      images={formData.images}
                      onImagesChange={(images) => setValue('images', images)}
                    />
                    {errors.images && (
                      <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      Start Date & Time
                    </label>
                    <div className="mt-1">
                      <input
                        type="datetime-local"
                        id="startDate"
                        value={formatDateForInput(formData.startDate)}
                        onChange={(e) => setValue('startDate', new Date(e.target.value))}
                        className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md"
                      />
                      {errors.startDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.startDate.message?.toString()}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                      End Date & Time
                    </label>
                    <div className="mt-1">
                      <input
                        type="datetime-local"
                        id="endDate"
                        value={formatDateForInput(formData.endDate)}
                        onChange={(e) => setValue('endDate', new Date(e.target.value))}
                        className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md"
                      />
                      {errors.endDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.endDate.message?.toString()}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <div className="mt-1">
                    <LocationInput
                      id="location"
                      value={formData.location}
                      onChange={(location, coordinates) => {
                        setValue('location', location);
                        if (coordinates) {
                          setValue('coordinates', coordinates);
                        }
                      }}
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location.message?.toString()}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <div className="mt-1">
                    <select
                      id="category"
                      {...register('categoryId')}
                      className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="mt-1 text-sm text-red-600">{errors.categoryId.message?.toString()}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
                    Maximum Participants
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="maxParticipants"
                      {...register('maxParticipants', { valueAsNumber: true })}
                      min="1"
                      className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md"
                    />
                    {errors.maxParticipants && (
                      <p className="mt-1 text-sm text-red-600">{errors.maxParticipants.message?.toString()}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      {...register('isPrivate')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                      Make this activity private
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPaid"
                      {...register('isPaid')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-700">
                      This is a paid activity
                    </label>
                  </div>

                  {formData.isPaid && (
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        Price
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          id="price"
                          {...register('price', { valueAsNumber: true })}
                          min="0"
                          step="0.01"
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-300 rounded-md"
                        />
                        {errors.price && (
                          <p className="mt-1 text-sm text-red-600">{errors.price.message?.toString()}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? 'Creating...' : 'Create Activity'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 