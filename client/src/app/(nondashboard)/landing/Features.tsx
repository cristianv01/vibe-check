"use client"
import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'

const containerVariants = {
  hidden: {opacity: 0, y: 50},
  visible: {opacity: 1, y:0, transition: {duration: 0.5, staggerChildren: 0.2}}
}

const itemVariants = {
  hidden:  {opacity: 0, y: 20},
  visible: {opacity: 1, y:0},
}

const Features = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{once: true}}
      variants={containerVariants}
      className='py-24 px-6 sm:px-8 lg:px-12 xl:px-16 bg-white'
    >
      <div className='max-w-4xl xl:max-w-6xl mx-auto'>
        <motion.h2
        variants={itemVariants}
          className='text-3xl font-bold text-center mb-12 w-full sm:w-2/3 mx-auto'
        
        >
          Features
        </motion.h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16'>
          {[0,1,2].map((idx) =>(
            <motion.div key={idx} variants={itemVariants}>
              <FeatureCard
                imageSrc={`/landing-search${3-idx}.png`}
                title={
                  [
                    "Find your vibe",
                    "Post your experiences",
                    "Connect with others"
                  ][idx]
                }
                description={
                  [
                    "Discover the best places to eat, drink, and explore in your area",
                    "Share your favorite spots and get recommendations from others",
                    "Connect with people and places who match your vibe"
                  ][idx]
                }
                link={
                  [
                    "Find your vibe",
                    "Post your experiences",
                    "Connect with others"
                  ][idx]
                }
                hrefText={
                  [
                    "/search",
                    "/search",
                    "/search"
                  ][idx]
                }
              >

              </FeatureCard>

            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

//Related component for the individual feature cards
const FeatureCard = ({
  imageSrc,
  title,
  description,
  link,
  hrefText
}:{
  imageSrc: string;
  title: string;
  description: string;
  link: string;
  hrefText: string;
}) => {
  return (
    <div className='text-center'>
      <div className= "p-4 rounded-lg mb-4 flex items-center justify-center h-48">
        <Image
          src={imageSrc}
          width={400}
          height={400}
          className='w-full h-full object-contain'
          alt={title}
        />
      </div>
      <h3 className='text-xl font-semibold mb-2'>{title}</h3>
      <p className='mb-4'>{description}</p>
      <Link href={hrefText} className='inline-block border border-gray-300 rounded px-4 py-2 hover:bg-gray-100' scroll={false}>{link}</Link>
    </div>
  )
}

export default Features;
