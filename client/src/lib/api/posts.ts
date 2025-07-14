import { api } from '@/state/api';

export interface Post {
  id: number;
  title?: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    username: string;
    profilePictureUrl?: string;
  };
  location: {
    id: number;
    name: string;
    address: string;
    status: string;
    coordinates?: {
      longitude: number;
      latitude: number;
    };
  };
  tags: Array<{
    id: number;
    tagName: string;
  }>;
}

export interface CreatePostData {
  title?: string;
  content: string;
  locationName: string;
  locationAddress: string;
  latitude: number;
  longitude: number;
  tags?: string[];
  mediaUrl?: string;
}

export interface GetPostsParams {
  locationId?: number;
  authorId?: number;
  limit?: number;
  offset?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  search?: string;
  tags?: string[];
}

// RTK Query API endpoints
export const postsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], GetPostsParams>({
      query: (params) => ({
        url: '/posts',
        method: 'GET',
        params,
      }),
      providesTags: ['Posts'],
    }),

    getPost: builder.query<Post, number>({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Posts', id }],
    }),

    createPost: builder.mutation<Post, CreatePostData>({
      query: (data) => ({
        url: '/posts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Posts'],
    }),

    updatePost: builder.mutation<Post, { id: number; data: Partial<CreatePostData> }>({
      query: ({ id, data }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Posts', id },
        'Posts',
      ],
    }),

    deletePost: builder.mutation<void, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Posts'],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postsApi;

// Helper function to upload file to S3
export const uploadFileToS3 = async (file: File): Promise<string> => {
  try {
    // First, get a pre-signed URL from your backend
    const response = await fetch('/api/upload/presigned-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileType: file.type,
        fileName: file.name,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadUrl, fileUrl } = await response.json();

    // Upload directly to S3 using the pre-signed URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3');
    }

    return fileUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}; 