"use client"
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSideBar from "@/components/AppSideBar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import React from "react";
import { useGetAuthUserQuery } from "@/state/api";

const DashboardLayout = ({children}:{children:React.ReactNode}) => {

  const {data: authUser} = useGetAuthUserQuery();
  const userType = authUser?.userRole.toLowerCase();

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
