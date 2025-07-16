import Image from 'next/image'
import React from 'react'

const page = () => {
  return (
    <div>
        <div className='flex flex-col items-center justify-center h-screen'>

        
        <h1 className='flex justify-center items-center text-6xl font-bold mt-10'>Under Construction</h1>
        <Image className='mt-10' src="/construction.png" alt="VibeCheck" width={500} height={500} />
        </div>
    
    </div>
  )
}

export default page