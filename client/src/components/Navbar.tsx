"use client"
import { NAVBAR_HEIGHT } from '@/lib/constants'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { Button } from './ui/button'
import { useGetAuthUserQuery } from '@/state/api'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'aws-amplify/auth'
import { Bell, MessageCircle, Plus, Search } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { SidebarTrigger } from './ui/sidebar'

const Navbar = () => {
    const {data: authUser} = useGetAuthUserQuery();
    const router = useRouter();
    const pathname = usePathname();

    const isDashboardPage = pathname.includes("/owners") || pathname.includes("/users");

    const handleSignOut = async () =>{
        await signOut();
        //better than using router
        window.location.href = "/";
    }
    return (
        <div
        className='fixed top-0 left-0 w-full z-50 shadow-xl'
        style={{height: `${NAVBAR_HEIGHT}px`}}>
            <div className="flex items-center justify-between w-full py-3 px-8 bg-primary-800 text-primary-100">
                <div className='flex items-center gap-4 md:gap-6'>
                    {isDashboardPage && (
                        <div className='md:hidden'>
                            <SidebarTrigger/>
                        </div>
                    )}
                    <Link href="/" className="cursor-pointer hover:!text-accent-300" scroll={false}>
                        <div className='flex items-center gap-3'>
                            <Image
                                src="/logo.svg"
                                alt="VibeCheck Logo"
                                width={24}
                                height={24}
                                className='w-6 h-6'
                            />
                            <div className='text-xl font-bold'>
                                VIBE
                                <span className='text-accent-500 font-light hover:text-accent-300'>CHECK</span>
                            </div>
                        </div>
                    </Link>
                    {isDashboardPage && authUser &&(
                        <Button
                            variant="secondary"
                            className="md:ml-4 bg-primary-50 text-primary-700 hover:bg-secondary-500 hover:text-primary-50"
                            onClick = {() => router.push(
                                authUser.userRole?.toLowerCase() === "owner" ? '/owners/owned-locations' : '/search'
                            )}>
                            {authUser.userRole?.toLowerCase() === "owner" ? (
                                <>
                                    <Plus className="h-4 w-4"></Plus>
                                    <span className="hidden md:block ml-2">Add New Establishment</span>
                                </>
                            ):(
                                <>
                                    <Search className="h-4 w-4"></Search>
                                    <span className="hidden md:block ml-2">Search Vibes</span>
                                </>
                            )}    
                        </Button>
                    )}

                </div>
                {!isDashboardPage && <p className='text-primary-200 hidden md:block'>See what it&apos;s really like through our community map and know before you go.</p>}
                <div className='flex items-center gap-5'>
                    {authUser ? (
                        <>
                            <div className='relative hidden md:block'>
                                <MessageCircle className='w-6 h-6 cursor-pointer text-primary-200 hover:text-primary-400'></MessageCircle>
                                <span className='absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full'></span>
                            </div>
                            <div className='relative hidden md:block'>
                                <Bell className='w-6 h-6 cursor-pointer text-primary-200 hover:text-primary-400'></Bell>
                                <span className='absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full'></span>
                            </div>
                            
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
                        <Avatar>
                            <AvatarImage src={authUser.userInfo?.image} />
                            <AvatarFallback className="bg-primary-600">
                            {authUser.userRole?.[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <p className="text-primary-200 hidden md:block">
                            {authUser.userInfo?.username}
                        </p>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white text-primary-700">
                        <DropdownMenuItem
                            className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100 font-bold"
                            onClick={() =>
                            router.push(
                                authUser.userRole?.toLowerCase() === "manager"
                                ? "/owners/owned-locations"
                                : "/users/favorites",
                                { scroll: false }
                            )
                            }
                        >
                            Go to Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-primary-200" />
                        <DropdownMenuItem
                            className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100"
                            onClick={() =>
                            router.push(
                                `/${authUser.userRole?.toLowerCase()}s/settings`,
                                { scroll: false }
                            )
                            }
                        >
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100"
                            onClick={handleSignOut}
                        >
                            Sign out
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>                    
                        </>
                    ) : (
                    <>
                    <Link href="/signin">
                        <Button
                        variant="outline"
                        className='text-primary-100 border-primary-300 bg-transparent hover:bg-primary-100 hover:text-primary-800 rounded-lg'
                        >Sign In</Button>
                    </Link>
                    <Link href="/signup">
                        <Button
                        variant="secondary"
                        className='text-primary-100 border-accent-500 bg-secondary-500 hover:border-accent-600 rounded-lg'
                        >Sign Up</Button>
                    </Link>
                    </>)}
                </div>
            </div>
        </div>
    )
}

export default Navbar;
