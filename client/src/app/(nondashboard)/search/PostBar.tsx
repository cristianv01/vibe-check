import Card from "@/components/Card";
import CardCompact from "@/components/CardCompact";
import { useAddFavoritePostMutation, useGetAuthUserQuery, useGetPostsQuery, useRemoveFavoritePostMutation } from "@/state/api";
import { useAppSelector } from "@/state/redux";
import React from "react";
import { toast } from "sonner";

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

const PostBar = () => {
    const {data: authUser, isLoading: authLoading, error: authError} = useGetAuthUserQuery();
    const [addFavorite] = useAddFavoritePostMutation();
    const [removeFavorite] = useRemoveFavoritePostMutation();
    const viewMode = useAppSelector((state) => state.global.viewMode);
    const filters = useAppSelector((state) => state.global.filters);

    // Debug logging
    console.log('Auth user:', authUser);
    console.log('Auth loading:', authLoading);
    console.log('Auth error:', authError);

    const {
        data: posts,
        isLoading,
        isError
    } = useGetPostsQuery(filters)

    // Debug logging
    console.log('Current filters:', filters);
    console.log('Posts data:', posts);

    const handleFavoriteToggle = async(postId: number) =>{
        if (!authUser) return ;
        
        const isFavorite = authUser?.userInfo?.favoritePosts?.some(
            (fav: FavoritePost) => fav.post.id === postId
        ) || false;

        console.log('Current favorite state:', isFavorite, 'for post:', postId)
        console.log('Current favorites:', authUser?.userInfo?.favoritePosts)

        try {
            if (isFavorite){
                console.log('Removing favorite for post:', postId)
                await removeFavorite({cognitoId: authUser.cognitoInfo.userId, postId}).unwrap()
                toast.success("Post removed from favorites!");
            }else{
                console.log('Adding favorite for post:', postId)
                await addFavorite({cognitoId: authUser.cognitoInfo.userId, postId}).unwrap()
                toast.success("Post added to favorites!");
            }
        } catch (error: unknown) {
            console.error('Error toggling favorite:', error)
            // If we get "Post already favorited", it means the post is already favorited
            // so we should try to remove it instead
            if ((error as ApiError)?.data?.message === "Post already favorited") {
                console.log('Post already favorited, attempting to remove...')
                try {
                    await removeFavorite({cognitoId: authUser.cognitoInfo.userId, postId}).unwrap()
                } catch (removeError) {
                    console.error('Error removing favorite:', removeError)
                }
            }
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center">
                <div className="flex flex-col justify-between gap-5 border rounded-lg p-5 h-full w-full">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-48 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center">
                <div className="flex flex-col justify-between gap-5 border border-red-500 rounded-lg p-5 h-full w-full">
                    <div className="text-center text-red-500">
                        <p>Error loading posts. Please try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center">
            <div className="flex flex-col justify-between gap-5 border rounded-lg p-5 h-full w-full">
                <h3 className="text-sm px-4 font-bold">
                    {posts?.length || 0}{" "}
                    <span className="text-gray-700 font-normal">
                        Posts in {filters.location || "All Locations"}
                    </span>
                    {filters.coordinates && filters.coordinates.length === 2 && !filters.location && (
                        <span className="text-xs text-blue-600 ml-2">
                            📍 (Geolocated at {filters.coordinates[1].toFixed(4)}, {filters.coordinates[0].toFixed(4)})
                        </span>
                    )}
                </h3>
                
                <div className="flex-1 overflow-y-auto">
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {posts?.map((post) => (
                                <Card 
                                    key={post.id} 
                                    post={post} 
                                    isFavorite={
                                        authUser?.userInfo.favoritePosts?.some((fav: FavoritePost) => fav.post.id === post.id) || false
                                    }
                                    onFavoriteToggle={() => handleFavoriteToggle(post.id)}
                                    showFavoriteButton={!!authUser}
                                />
                            ))}
                        </div>
                                            ) : (
                        <div className="flex flex-col gap-4 p-4">
                            {posts?.map((post) => (
                                <CardCompact
                                    key={post.id}
                                    post={post}
                                    isFavorite={
                                        authUser?.userInfo.favoritePosts?.some((fav: FavoritePost) => fav.post.id === post.id) || false
                                    }
                                    onFavoriteToggle={() => handleFavoriteToggle(post.id)}
                                    showFavoriteButton={!!authUser}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostBar;
