"use client"
import React from 'react'

import { NAVBAR_HEIGHT } from '@/lib/constants'
import Navbar from '@/components/Navbar'
import { useGetAuthUserQuery } from '@/state/api';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
const Layout = ({children}: {children: React.ReactNode}) => {
  const {data: authUser, isLoading: authLoading} = useGetAuthUserQuery();
  const router = useRouter();
  const pathname = usePathname(); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(()=>{
    if(authUser){
        const userRole = authUser.userRole?.toLowerCase();
        if(userRole === "owner" && pathname.startsWith("/search") ||
        userRole === "owner" && pathname === '/'){
            router.push("/owners/owned-properties", {scroll:false});
        }
        setIsLoading(false);
    }else if(!authLoading){
        setIsLoading(false);
    }
   
  }, [authUser, pathname, router, authLoading])

  if (authLoading || isLoading) return <div>Loading...</div>;

  return (
    <div className='h-full w-full'>
      <Navbar/>
      <main 
        className="h-full flex w-full flex-col"
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        {children}
      </main>
      
    </div>
  )
}

export default Layout
