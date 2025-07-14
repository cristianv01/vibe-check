# VibeCheck Development Guide

## 🚀 Core Features Implementation Roadmap

This guide provides a comprehensive, step-by-step approach to implementing the core functionalities of VibeCheck: post creation, data fetching/display, and search/filtering capabilities.

## 📋 Current Status

✅ **Completed:**
- Next.js frontend with TypeScript and Tailwind CSS
- Node.js/Express backend with Prisma ORM
- PostgreSQL database with PostGIS for geographic data
- Redux state management with RTK Query
- AWS S3 integration ready
- Authentication flow with AWS Cognito
- Basic post CRUD operations in backend
- Create Post modal component
- Posts Map component with Mapbox integration
- API service layer for posts

🔄 **In Progress:**
- S3 file upload service (needs @aws-sdk/s3-request-presigner package)
- Frontend integration and testing

## 🎯 Implementation Steps

### 1. Post Creation Flow

#### Step 1.1: Complete S3 Upload Service
```bash
# Install missing package
cd server && npm install @aws-sdk/s3-request-presigner
```

**File:** `server/src/services/s3Service.ts` ✅ (Created)
- Pre-signed URL generation for direct client-to-S3 uploads
- File management utilities

#### Step 1.2: Add Upload Endpoint
**File:** `server/src/routes/uploadRoutes.ts` (Create new)
```typescript
import express from 'express';
import { S3Service } from '../services/s3Service';

const router = express.Router();

router.post('/presigned-url', async (req, res) => {
  try {
    const { fileType, fileName, folder } = req.body;
    
    const result = await S3Service.generatePresignedUrl({
      fileType,
      fileName,
      folder: folder || 'posts'
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error generating upload URL' });
  }
});

export default router;
```

#### Step 1.3: Integrate Upload in CreatePostModal
**File:** `client/src/components/CreatePostModal.tsx` ✅ (Created)
- Form validation with Zod
- File upload with FilePond
- Tag management
- Location input with coordinates

#### Step 1.4: Connect to Backend
**File:** `client/src/lib/api/posts.ts` ✅ (Created)
- RTK Query mutations for post creation
- S3 upload helper function

### 2. Data Fetching and Display

#### Step 2.1: Enhanced Backend Queries
**File:** `server/src/controllers/postController.ts` ✅ (Updated)
- Efficient Prisma queries with includes
- Geographic filtering with PostGIS
- Pagination support
- Search functionality

#### Step 2.2: Posts Feed Component
**File:** `client/src/components/PostsFeed.tsx` (Create new)
```typescript
"use client";

import React from 'react';
import { useGetPostsQuery } from '@/lib/api/posts';
import { Post } from '@/lib/api/posts';
import PostCard from './PostCard';

interface PostsFeedProps {
  filters?: {
    locationId?: number;
    authorId?: number;
    search?: string;
    tags?: string[];
    lat?: number;
    lng?: number;
    radius?: number;
  };
  viewMode?: 'grid' | 'list';
}

export default function PostsFeed({ filters, viewMode = 'grid' }: PostsFeedProps) {
  const { data: posts, isLoading, error } = useGetPostsQuery(filters || {});

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error loading posts</div>;

  return (
    <div className={`grid gap-4 ${
      viewMode === 'grid' 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
        : 'grid-cols-1'
    }`}>
      {posts?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

#### Step 2.3: Post Card Component
**File:** `client/src/components/PostCard.tsx` (Create new)
```typescript
"use client";

import React from 'react';
import { Post } from '@/lib/api/posts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  onClick?: () => void;
}

export default function PostCard({ post, onClick }: PostCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.author.profilePictureUrl} />
            <AvatarFallback>{post.author.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{post.author.username}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-3 w-3" />
              <span>{post.location.name}</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {post.title && (
          <h4 className="font-medium mb-2">{post.title}</h4>
        )}
        
        <p className="text-gray-700 mb-3 line-clamp-3">{post.content}</p>
        
        {post.mediaUrl && (
          <img 
            src={post.mediaUrl} 
            alt="Post media" 
            className="w-full h-48 object-cover rounded-md mb-3"
          />
        )}
        
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.tagName}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Step 2.4: Map Integration
**File:** `client/src/components/PostsMap.tsx` ✅ (Created)
- Mapbox integration with custom markers
- Popup information for each post
- Geographic bounds handling

### 3. Search and Filtering

#### Step 3.1: Enhanced Backend Filtering
**File:** `server/src/controllers/postController.ts` ✅ (Updated)
- Tag-based filtering
- Geographic radius search
- Text search in title and content
- Pagination with cursor-based approach

#### Step 3.2: Filter Components
**File:** `client/src/components/FiltersBar.tsx` ✅ (Created - needs completion)
**File:** `client/src/components/SearchFilters.tsx` (Create new)
```typescript
"use client";

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/state/redux';
import { setFilters } from '@/state';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Filter, X } from 'lucide-react';

export default function SearchFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.global.filters);

  const handleSearchChange = (value: string) => {
    dispatch(setFilters({ search: value, page: 1 }));
  };

  const handleLocationChange = (value: string) => {
    dispatch(setFilters({ location: value, page: 1 }));
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags;
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    dispatch(setFilters({ tags: newTags, page: 1 }));
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search posts..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Location..."
            value={filters.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Popular Tags */}
      <div>
        <h4 className="text-sm font-medium mb-2">Popular Tags</h4>
        <div className="flex flex-wrap gap-2">
          {['Quiet', 'WorkFriendly', 'GoodCoffee', 'FastWifi', 'Outdoor'].map((tag) => (
            <Badge
              key={tag}
              variant={filters.tags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {filters.tags.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Step 3.3: Main Search Page
**File:** `client/src/app/(nondashboard)/search/page.tsx` (Create new)
```typescript
"use client";

import React, { useState } from 'react';
import { useAppSelector } from '@/state/redux';
import { setViewMode } from '@/state';
import { useAppDispatch } from '@/state/redux';
import { useGetPostsQuery } from '@/lib/api/posts';

import SearchFilters from '@/components/SearchFilters';
import PostsMap from '@/components/PostsMap';
import PostsFeed from '@/components/PostsFeed';
import CreatePostModal from '@/components/CreatePostModal';
import { Button } from '@/components/ui/button';
import { Grid, List, Plus } from 'lucide-react';

export default function SearchPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.global.filters);
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: posts, isLoading } = useGetPostsQuery({
    search: filters.search,
    tags: filters.tags,
    lat: filters.coordinates[1],
    lng: filters.coordinates[0],
    radius: 10,
  });

  const handleMapBoundsChange = (bounds: any) => {
    // Update filters with new map bounds
    const center = bounds.getCenter();
    dispatch(setFilters({
      coordinates: [center.lng, center.lat],
    }));
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Discover Places</h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => dispatch(setViewMode('grid'))}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => dispatch(setViewMode('list'))}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        </div>
      </div>

      {/* Filters */}
      <SearchFilters />

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map View */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Map View</h2>
          <PostsMap
            posts={posts || []}
            onMapBoundsChange={handleMapBoundsChange}
            className="h-[600px]"
          />
        </div>

        {/* Posts Feed */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Reviews</h2>
          <PostsFeed
            filters={filters}
            viewMode={viewMode}
          />
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          // Handle post creation
          console.log('Creating post:', data);
        }}
      />
    </div>
  );
}
```

## 🔧 Environment Setup

### Required Environment Variables

**Backend (.env):**
```env
DATABASE_URL="postgresql://..."
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name"
JWT_SECRET="your-jwt-secret"
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:8000"
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"
```

### Database Migration
```bash
cd server
npx prisma migrate dev --name add_postgis
npx prisma generate
```

## 🚀 Next Steps

1. **Install missing dependencies:**
   ```bash
   cd server && npm install @aws-sdk/s3-request-presigner
   ```

2. **Complete the FiltersBar component** (fix remaining linter errors)

3. **Add upload routes to main server file**

4. **Test the complete flow:**
   - Create a post with image upload
   - View posts on map and in feed
   - Test search and filtering

5. **Add error handling and loading states**

6. **Implement real-time updates** (optional - using WebSockets)

## 📝 API Endpoints Summary

### Posts
- `GET /posts` - Get posts with filtering
- `GET /posts/:id` - Get single post
- `POST /posts` - Create new post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

### Upload
- `POST /upload/presigned-url` - Get S3 upload URL

### Authentication
- All post creation/editing requires authentication
- Use AWS Cognito JWT tokens

## 🎨 UI/UX Considerations

1. **Responsive Design:** All components work on mobile and desktop
2. **Loading States:** Show skeleton loaders during data fetching
3. **Error Handling:** User-friendly error messages
4. **Accessibility:** Proper ARIA labels and keyboard navigation
5. **Performance:** Lazy loading for images, pagination for posts

This guide provides a solid foundation for implementing VibeCheck's core features. Each component is designed to be modular and reusable, making it easy to extend and maintain. 