"use client"
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSideBar from "@/components/AppSideBar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import React, { useEffect, useState } from "react";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";

const DashboardLayout = ({children}:{children:React.ReactNode}) => {

  const {data: authUser, isLoading: authLoading} = useGetAuthUserQuery();
  const userType = authUser?.userRole.toLowerCase();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(()=>{
    if(authUser){
        const userRole = authUser.userRole?.toLowerCase();
        if(userRole === "owner" && pathname.startsWith("/users") ||
        userRole === "user" && pathname.startsWith("/owners")){
            router.push(userRole === "owner" ? "/owners/owned-properties" : "/users/favorites", {scroll:false});
        }
    }else{
        setIsLoading(false);
    }
   
  }, [authUser,pathname,router])

  if (authLoading || isLoading) return <div>Loading...</div>;
  if (!authUser?.userRole) return null;

if(!userType) return null;
  return (
    <SidebarProvider>
    <div className="min-h-screen w-full bg-primary-100">
        <Navbar/>
        <div style={{paddingTop:`${NAVBAR_HEIGHT}px`}}>
            <main className="flex">
                <AppSideBar userType={authUser.userRole.toLowerCase()} />
                <div className="flex-grow transition-all duration-300">
                    {children}
                </div>
            </main>
        </div>
      
    </div>
    </SidebarProvider>
  )
}

export default DashboardLayout
