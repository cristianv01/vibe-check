"use client";

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Tag, Image } from 'lucide-react';


registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const createPostSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, 'Review content is required'),
  locationName: z.string().min(1, 'Location name is required'),
  locationAddress: z.string().min(1, 'Location address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  tags: z.array(z.string()).optional(),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePostFormData & { mediaUrl?: string }) => Promise<void>;
}

export default function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileUpload = async (file: any) => {
    try {
      // TODO: Implement S3 upload logic here
      // For now, we'll simulate the upload
      const fakeUrl = `https://example.com/uploads/${file.filename}`;
      setUploadedMediaUrl(fakeUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const onSubmitForm = async (data: CreatePostFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        tags,
        mediaUrl: uploadedMediaUrl,
      });
      reset();
      setFiles([]);
      setTags([]);
      setUploadedMediaUrl(undefined);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Review</DialogTitle>
          <DialogDescription>
            Share your experience at this location with the community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Give your review a catchy title..."
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Review Content *</Label>
            <Textarea
              id="content"
              placeholder="Share your experience, tips, and thoughts about this location..."
              className="min-h-[120px]"
              {...register('content')}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <Label>Location Details</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="locationName">Location Name *</Label>
                <Input
                  id="locationName"
                  placeholder="e.g., Starbucks Downtown"
                  {...register('locationName')}
                />
                {errors.locationName && (
                  <p className="text-sm text-red-500">{errors.locationName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationAddress">Address *</Label>
                <Input
                  id="locationAddress"
                  placeholder="e.g., 123 Main St, City, State"
                  {...register('locationAddress')}
                />
                {errors.locationAddress && (
                  <p className="text-sm text-red-500">{errors.locationAddress.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 40.7128"
                  {...register('latitude', { valueAsNumber: true })}
                />
                {errors.latitude && (
                  <p className="text-sm text-red-500">{errors.latitude.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., -74.0060"
                  {...register('longitude', { valueAsNumber: true })}
                />
                {errors.longitude && (
                  <p className="text-sm text-red-500">{errors.longitude.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <Label>Tags</Label>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags (e.g., Quiet, WorkFriendly)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <Label>Add Photos (Optional)</Label>
            </div>
            
            <FilePond
              files={files}
              onupdatefiles={setFiles}
              onaddfile={(error, file) => {
                if (!error) {
                  handleFileUpload(file);
                }
              }}
              allowMultiple={false}
              maxFiles={1}
              acceptedFileTypes={['image/*']}
              labelIdle='Drag & Drop your photo or <span class="filepond--label-action">Browse</span>'
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 