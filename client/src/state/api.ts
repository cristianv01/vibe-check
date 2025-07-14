/* eslint-disable @typescript-eslint/no-explicit-any */
import { Owner, User, Post } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { createNewUserInDatabase, withToast } from "@/lib/utils";
import { FiltersState } from "./index";



export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async(headers)=>{
      const session = await fetchAuthSession();
      const {idToken} = session.tokens ?? {};
      if (idToken){
        headers.set("Authorization", `Bearer ${idToken}`)
      }
      return headers;
    }
  }),
  reducerPath: "api",
  tagTypes: ["Owners", "Users", "Posts"],
  endpoints: (build) => ({
    getAuthUser: build.query<User, void>({
      queryFn: async(_, _queryApi, _extraOptions, fetchWithBQ)=>{
        try{
          const session = await fetchAuthSession();
          const {idToken} = session.tokens ?? {};
          const user = await getCurrentUser();
          const userRole = idToken?.payload["custom:role"] as string;

          const endpoint =
            userRole === "owner" ?
             `/owners/${user?.userId}` : `/users/${user?.userId}`;
          let userDetailsResponse = await fetchWithBQ(endpoint)

          //If user doesnt exist
          if (userDetailsResponse.error && userDetailsResponse.error.status === 404){
            userDetailsResponse = await createNewUserInDatabase(user, idToken, userRole, fetchWithBQ)
          }
          return {
            data:{
              cognitoInfo: {...user},
              userInfo: userDetailsResponse.data as User | Owner,
              userRole
            }
          }
        }catch(error: any){
          return {error:error.message || "Failed to fetch user details"}
        }
      },
      providesTags: () => [{ type: "Users", id: "LIST" }]
  }),
  updateUserSettings: build.mutation<User, {cognitoId: string} & Partial<User>>({
    query: ({cognitoId, ...updatedUser}) => ({
      url: `users/${cognitoId}`,
      method: "PUT",
      body: updatedUser,
    }),
    invalidatesTags:(result) => [{type:"Users", id: result?.id}],
    async onQueryStarted(_, {queryFulfilled}){
        
      await withToast(queryFulfilled, { 
        success: "User settings updated successfully.",
        error: "Failed to update user settings.",
      });

  }
  }),
  updateOwnerSettings: build.mutation<Owner, {cognitoId: string} & Partial<Owner>>({
    query: ({cognitoId, ...updatedOwner}) => ({
      url: `owners/${cognitoId}`,
      method: "PUT",
      body: updatedOwner,
    }),
    invalidatesTags:(result) => [{type:"Owners", id: result?.id}],
  }),
  //Post related endpoints
  getPosts: build.query<Post[], Partial<FiltersState> & {favoriteIds?: number[]}>({
    query: (params) => {
      const searchParams = new URLSearchParams();
      
      // Add filter parameters to query string
      if (params.location) searchParams.append('location', params.location);
      if (params.tags && params.tags.length > 0) searchParams.append('tags', params.tags.join(','));
      // Only send coordinates if a specific location is selected (not just geolocated)
      if (params.location && params.coordinates && params.coordinates.length === 2) {
        searchParams.append('lat', params.coordinates[1].toString());  // latitude
        searchParams.append('lng', params.coordinates[0].toString());  // longitude
        searchParams.append('radius', '50');  // 500km radius to see posts in NY from VA
      }
      if (params.date) searchParams.append('date', params.date);
      if (params.sort) searchParams.append('sort', params.sort);
      if (params.order) searchParams.append('order', params.order);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.favoriteIds && params.favoriteIds.length > 0) searchParams.append('favoriteIds', params.favoriteIds.join(','));
      
      return {
        url: `/posts?${searchParams.toString()}`,
        method: 'GET',
      };
    },
    providesTags: (result) => 
      result 
        ? [
            ...result.map(({ id }) => ({ type: 'Posts' as const, id })),
            { type: 'Posts', id: 'LIST' }
          ]
        : [{ type: 'Posts', id: 'LIST' }],
      async onQueryStarted(_, {queryFulfilled}){
        
          await withToast(queryFulfilled, {
            error: "Failed to fetch posts.",
          });
   
      }
  }),


  //User/post related endpoints
  addFavoritePost: build.mutation<User, {cognitoId: string, postId: number}>({
    query: ({cognitoId, postId}) => ({
      url: `users/${cognitoId}/favorites/${postId}`,
      method: "POST",
    }),
    invalidatesTags: () => [
      {type: "Users", id: "LIST"},
      {type: "Posts", id: "LIST"}
    ],
    async onQueryStarted(_, {queryFulfilled}){
        
      await withToast(queryFulfilled, { 
        success: "Post added to favorites.",
        error: "Failed to add post to favorites.",
      });

  }
  }),
  
  removeFavoritePost: build.mutation<User, {cognitoId: string, postId: number}>({
    query: ({cognitoId, postId}) => ({
      url: `users/${cognitoId}/favorites/${postId}`,
      method: "DELETE",
    }),
    invalidatesTags: () => [
      {type: "Users", id: "LIST"},
      {type: "Posts", id: "LIST"}
    ],
    async onQueryStarted(_, {queryFulfilled}){
        
      await withToast(queryFulfilled, { 
        success: "Post removed from favorites.",
        error: "Failed to remove post from favorites.",
      });

  }
  }),


}),
  
});

export const {
  useGetAuthUserQuery,
  useUpdateUserSettingsMutation,
  useUpdateOwnerSettingsMutation,
  useGetPostsQuery,
  useAddFavoritePostMutation,
  useRemoveFavoritePostMutation,
} = api;
