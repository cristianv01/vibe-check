'use client'
import React from 'react'
import CreatePost from '@/components/CreatePost'
import Card from '@/components/Card'
import { useGetPostsQuery, useGetAuthUserQuery } from '@/state/api'
import { useAppSelector } from '@/state/redux'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PostsPage = () => {
  const { data: user } = useGetAuthUserQuery()
  const filters = useAppSelector((state) => state.global.filters)

  // Get posts for the current user
  const { data: posts, isLoading, error } = useGetPostsQuery({
    authorId: user?.userInfo?.id,
    limit: 50,
    page: 1
  }, {
    skip: !user?.userInfo?.id // Skip the query if user is not loaded yet
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-gray-600">Loading your posts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading posts</p>
          <p className="text-gray-600 text-sm">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
          <p className="text-gray-600 mt-2">
            Manage and view all your posts
          </p>
        </div>
        <CreatePost />
      </div>

      {/* Posts Grid */}
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card
              key={post.id}
              post={post}
              isFavorite={false} // User's own posts don't need favorite functionality
              onFavoriteToggle={() => {}} // No-op for user's own posts
              showFavoriteButton={false}
              postLink={`/posts/${post.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start sharing your experiences with the community by creating your first post.
            </p>
            <CreatePost />
          </div>
        </div>
      )}
    </div>
  )
}

export default PostsPage
