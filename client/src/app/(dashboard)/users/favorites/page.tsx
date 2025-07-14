/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import Header from '@/components/Header';
import Card from '@/components/Card';
import CardCompact from '@/components/CardCompact';
import { useGetAuthUserQuery, useAddFavoritePostMutation, useRemoveFavoritePostMutation } from '@/state/api';
import { useAppSelector, useAppDispatch } from '@/state/redux';
import { setViewMode } from '@/state';
import { Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import Loading from '@/components/Loading';
import { Post } from '@/types/prismaTypes';

interface FavoritePost {
    post: {
        id: number;
    };
}

interface ApiError {
    data?: {
        message?: string;
    };
}

const Favorites = () => {
  const {data: authUser, isLoading: authLoading} = useGetAuthUserQuery();
  const [isLoading, setIsLoading] = useState(false);
  const [addFavorite] = useAddFavoritePostMutation();
  const [removeFavorite] = useRemoveFavoritePostMutation();
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const dispatch = useAppDispatch();

  const handleFavoriteToggle = async(postId: number) =>{
    if (!authUser) return ;
    
    const isFavorite = authUser.userInfo.favoritePosts?.some(
        (fav: FavoritePost) => fav.post.id === postId
    ) || false;

    try {
        if (isFavorite){
            await removeFavorite({cognitoId: authUser.cognitoInfo.userId, postId}).unwrap()
        }else{
            await addFavorite({cognitoId: authUser.cognitoInfo.userId, postId}).unwrap()
        }
    } catch (error: unknown) {
        console.error('Error toggling favorite:', error)
        // If we get "Post already favorited", it means the post is already favorited
        // so we should try to remove it instead
        if ((error as ApiError)?.data?.message === "Post already favorited") {
            try {
                await removeFavorite({cognitoId: authUser.cognitoInfo.userId, postId}).unwrap()
            } catch (removeError) {
                console.error('Error removing favorite:', removeError)
            }
        }
    }
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const favoritePosts = authUser?.userInfo.favoritePosts?.map((fav: { post: any; }) => fav.post) || [];

  if (isLoading) return <Loading />
  
  return (
    <div className="p-6">
      <Header title="Favorites" description="Your favorite posts" />
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {favoritePosts.length} Favorite Post{favoritePosts.length !== 1 ? 's' : ''}
          </h2>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => dispatch(setViewMode("grid"))}
              className="flex items-center gap-2"
            >
              <Grid className="w-4 h-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => dispatch(setViewMode("list"))}
              className="flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              List
            </Button>
          </div>
        </div>

        {favoritePosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite posts yet</h3>
            <p className="text-gray-500">Start exploring posts and add them to your favorites to see them here.</p>
          </div>
        ) : (
          <div className="overflow-y-auto">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoritePosts.map((post: Post) => (
                  <Card 
                    key={post.id} 
                    post={post} 
                    isFavorite={true}
                    onFavoriteToggle={() => handleFavoriteToggle(post.id)}
                    showFavoriteButton={true}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {favoritePosts.map((post: Post) => (
                  <CardCompact
                    key={post.id}
                    post={post}
                    isFavorite={true}
                    onFavoriteToggle={() => handleFavoriteToggle(post.id)}
                    showFavoriteButton={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites;
