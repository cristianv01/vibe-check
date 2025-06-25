import { User } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

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
  tagTypes: [],
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
             `/owner/${user?.userId}` : `/user/${user?.userId}`;
          let userDetailsResponse = await fetchWithBQ(endpoint)

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
  })
  }),
});

export const {} = api;
