import { NAVBAR_HEIGHT } from '@/lib/constants'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { Button } from './ui/button'

const Navbar = () => {
  return (
    <div
    className='fixed top-0 left-0 w-full z-50 shadow-xl'
    style={{height: `${NAVBAR_HEIGHT}px`}}>
        <div className="flex items-center justify-between w-full py-3 px-8 bg-primary-800 text-primary-100">
            <div className='flex items-center gap-4 md:gap-6'>
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
                
            </div>
            <p className='text-primary-200 hidden md:block'>See what it&apos;s really like through our community map and know before you go.</p>
            <div className='flex items-center gap-5'>
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
            </div>
        </div>
    </div>
  )
}

export default Navbar;
