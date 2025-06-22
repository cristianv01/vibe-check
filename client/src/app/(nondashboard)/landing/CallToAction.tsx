"use client"
import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
const CallToAction = () => {
  return (
    <div className='relative py-24'>
        <Image src="/landing-call-to-action.jpg" alt="Call to Action" fill className='object-cover object-center' />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <motion.div
         initial={{opacity:0, y:20}}
         transition={{duration: 0.5}}
         whileInView={{opacity:1, y:0}}
         viewport={{once: true}}
         className='relative max-w-4xl xl:max-w-6xl mx-auto px-6 sm:px8 lg:px-12 xl:px-16 py-12 '
        >
            <div className='flex flex-col md:flex-row justify-between '>
                <div className='mb-6 md:mb-0 md:mr-10'>
                    <h2 className='text-2xl font-bold text-white'>Find your vibe</h2>
                   
                </div>
                <p className='text-white mb-3'>
                    Explore a wide range of experiences in your desired location 
                </p>
                <div className='flex justify-center md:justify-start gap-4'>
                    <button onClick={()=>window.scrollTo({top:0, behavior:'smooth'})} className='bg-secondary-500 text-white hover:bg-secondary-600 rounded-lg px-4 py-2'>
                        Search
                    </button>
                </div>
            </div>


        </motion.div>

    </div>
  )
}

export default CallToAction
