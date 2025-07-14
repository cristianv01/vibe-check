'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { setFilters } from '@/state'
const Hero = () => {

    const dispatch = useDispatch();
    const [search, setSearchQuery] = useState("");
    const router = useRouter(); 

    const handleSearch = async () =>{
        try{
            const trimmedSearch = search.trim();
            if(!trimmedSearch) return;

            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmedSearch)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&fuzzyMatch=true`);

            const data = await response.json();
            if (data.features && data.features.length > 0){
                const [lng, lat] = data.features[0].center;
                dispatch(setFilters({
                    location: trimmedSearch,
                    coordinates: [lng, lat]
                }));
                const params = new URLSearchParams({
                    location: trimmedSearch,
                    lng: lng.toString(),
                    lat: lat.toString()
                });
                router.push(`/search?${params.toString()}`);
            }
        } catch (error) {
            console.error('Error searching location:', error);
        }
    };
    
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
                    <Input 
                        type='text' 
                        value={search} 
                        placeholder='Search by city, neighborhood, or address' 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className='w-full max-w-lg rounded-none rounded-l-xl border-none bg-white h-12'
                    />
                    <Button
                        onClick={handleSearch}
                        className='bg-secondary-500 text-white hover:bg-secondary-500 text-white rounded-none rounded-r-xl border-none hover:bg-secondary-600 h-12'
                    >
                        Search
                    </Button>
                </div>
            </div>

        </motion.div>
    </div>
  );
};

export default Hero;
