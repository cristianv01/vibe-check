'use client'
import React from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
const Hero = () => {
  return (
    <div className='relative h-screen'>
        <Image
            src="/landing-splash.jpg"
            alt="VibeCheck Hero Section"
            fill
            className='object-cover object-center'
            priority
        />
        <div className='absolute inset-0 bg-black bg-opacity-60'></div>
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8}}
            className='absolute top-1/3 transform -translate-x-1/2 -translate-y-1/2 text-center w-full'

        >
            <div className='max-w-4xl mx-auto px-16 sm:px-12'>
                <h1 className='text-5xl font-bold text-white mb-4'>
                Stop guessing if you&apos;ll fit in. Start exploring with confidence.
                </h1>
                <p className='text-xl text-primary-200 mb-8'>
                    Explore local communities, find hidden gems, and get and inside look from locals.
                </p>
                <div className='flex justify-center'>
                    <Input type='text' placeholder='Search by city, neighborhood, or address' onChange={() =>{}} className='w-full max-w-lg rounded-none rounded-l-xl border-none bg-white h-12'>
                    
                    </Input>
                    <Button
                    onClick={() => {}}
                    className='bg-secondary-500 text-white hover:bg-secondary-500 text-white rounded-none rounded-r-xl border-none hover:bg-secondary-600 h-12'
                    >
                        Search
                    </Button>
                </div>
            </div>

        </motion.div>
    </div>
  );
}

export default Hero;
