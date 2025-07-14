import React from 'react'

const Header = ({title, description}: {title: string, description: string}) => {
  return (
    <div className="mb-5 mt-10">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      
    </div>
  )
};

export default Header
