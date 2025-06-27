/* eslint-disable @typescript-eslint/no-explicit-any */
import { Owner, User } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { createNewUserInDatabase } from "@/lib/utils";


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
  tagTypes: ["Owners", "Users"],
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
      }
  }),
  updateUserSettings: build.mutation<User, {cognitoId: string} & Partial<User>>({
    query: ({cognitoId, ...updatedUser}) => ({
      url: `users/${cognitoId}`,
      method: "PUT",
      body: updatedUser,
    }),
    invalidatesTags:(result) => [{type:"Users", id: result?.id}],
  }),
  updateOwnerSettings: build.mutation<Owner, {cognitoId: string} & Partial<Owner>>({
    query: ({cognitoId, ...updatedOwner}) => ({
      url: `owners/${cognitoId}`,
      method: "PUT",
      body: updatedOwner,
    }),
    invalidatesTags:(result) => [{type:"Owners", id: result?.id}],
  })

}),
  
});

export const {
  useGetAuthUserQuery,
  useUpdateUserSettingsMutation,
  useUpdateOwnerSettingsMutation,
} = api;
