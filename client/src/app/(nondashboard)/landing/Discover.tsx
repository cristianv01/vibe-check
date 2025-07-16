"use client"
import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'


const containerVariants = {
  hidden: {opacity: 0},
  visible: {opacity: 1,transition: {staggerChildren: 0.2}}
}

const itemVariants = {
  hidden:  {opacity: 0, y: 20},
  visible: {opacity: 1, y:0},
}

const Discover = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{once: true, amount: 0.8}}
      variants={containerVariants}
      className='py-12 bg-white mb-16'
    >
      <div className='max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 '>
        <motion.div
        variants={itemVariants}
          className='text-3xl font-bold text-center mb-12 w-full sm:w-2/3 mx-auto'
        
        >
            <h2 className='text-3xl font-semibold leading-tight text-gray-800'>Discover Your Scene, Authentically</h2>
            <p className="mt-4 text-lg text-gray-600">From the music and the lighting to the crowd and the service, get the real feel of a place before you ever step inside. Our community-driven map helps you find the exact experience you&apos;re looking for.</p>
        </motion.div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16'>
        {[
            {
                imageSrc: "/landing-icon-wand.png", // Icon for discovery/search
                title: "Find Your Perfect Vibe",
                description: "Search by more than just location. Use community-driven tags like #QuietAtmosphere, #GoodForDates, or #LiveMusic to find the exact experience you're looking for.",
            },
            {
                imageSrc: "/landing-icon-calendar.png", // Suggested: Icon for authentic content
                title: "See It For Yourself",
                description: "Browse unfiltered photos, videos, and honest reviews from our community. Get an authentic glimpse of a location before you commit to a visit.",
            },
            {
                imageSrc: "/landing-icon-heart.png", // Suggested: Icon for contributing/sharing
                title: "Share Your Own Vibe",
                description: "Become a trusted voice in your community. Share your experiences, add descriptive tags, and help others discover places where they'll feel right at home.",
            },
        ].map((card,idx) => (
            <motion.div key={idx} variants={itemVariants}>
                <DiscoverCard {...card}/>
            </motion.div>
        ))}
        </div>
      </div>
    </motion.div>
  );
}

// Related component for the individual feature cards
const DiscoverCard = ({
  imageSrc,
  title,
  description,

}:{
  imageSrc: string;
  title: string;
  description: string;

}) => {
  return (
    <div className='px-4 py-12 shadow-lg rounded-lg bg-primary-50 md:h-72 text-center'>
      <div className= "bg-primary-700 p-[0.6rem] rounded-full mb-4 h-10 w-10">
        <Image
          src={imageSrc}
          width={30}
          height={30}
          className='w-full h-full '
          alt={title}
        />
      </div>
      <h3 className='mt-4 text-xl font-medium text-gray-800'>{title}</h3>
      <p className='mt-2 text-base text-gray-500'>{description}</p>
    
    </div>
  )
}

export default Discover;
