"use client"
import React from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarContent, SidebarMenuButton, useSidebar } from './ui/sidebar'
import { Building, FileText, Heart, List, Menu, MessageCircle, Settings, X } from 'lucide-react';
import { NAVBAR_HEIGHT } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AppSidebarProps {
    userType: 'owner' | 'user';
}

const AppSideBar = ({userType}: AppSidebarProps) => {
    const {toggleSidebar, open} = useSidebar();
    const pathname = usePathname();
    const navLinks = 
        userType === "owner" ?
        [
            {icon: Building, label: "Owned Locations", href: "/owners/owned-locations"},
            {icon: FileText, label: "Responses", href: "/owners/Responses"},
            {icon: Settings, label: "Settings", href: "/owners/Settings"},
        ]
        :
        [
            {icon: Heart, label: "Favorites", href: "/users/favorites"},
            {icon: MessageCircle, label: "Posts", href: "/users/posts"},
            {icon: List, label: "Feed", href: "/users/feed"},
            {icon: Settings, label: "Settings", href: "/users/Settings"},
        ]
    return (
        <Sidebar collapsible='icon' className='fixed left-0 bg-white shadow-lg' style={{top: `${NAVBAR_HEIGHT}px`, height:`calc(100vh - ${NAVBAR_HEIGHT}px)`}}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className={cn(
                            "flex min-h-[56px] w-full items-center pt-3 mb-3",
                            open ? "justify-between px-6" : "justify-center"
                        )}>
                            {open ? (
                                <>
                                    <h1 className='text-xl font-bold text-gray-800'>
                                        {userType === "owner" ? "Owner View" : "User View"}
                                    </h1>
                                    <button className='hover:bg-gray-100 p-2 rounded-md' onClick={()=>toggleSidebar()}>
                                        <X className='w-6 h-6 text-gray-600'/>
                                    </button>
                                </>
                            ):(
                                <button className='hover:bg-gray-100 p-2 rounded-md' onClick={()=>toggleSidebar()}>
                                <Menu className='w-6 h-6 text-gray-600'/>
                                </button>
                            )}
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navLinks.map((link)=> {
                        const isActive = pathname === link.href;

                        return (
                            <SidebarMenuItem key={link.href}>
                                <SidebarMenuButton asChild className={cn("flex items-center px-7 py-7",
                                    isActive ? "bg-gray-200" : "text-gray-600 hover:bg-gray-100",
                                    open ? "text-blue-600" : "ml-[5px]"
                                )}>
                                    <Link href={link.href} className="w-full" scroll={false}>
                                        <div className="flex items-center gap-3">
                                            <link.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-600"}`} />
                                            <span className={`font-medium ${isActive ? "text-blue-600" : "text-gray-600"}`}>{link.label}</span>
                                        </div>

                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
          
        </Sidebar>
    )
}

export default AppSideBar
