//This is the landing page for the app
//It is how you get the routing
import React from 'react'
import Hero from './Hero'
import Features from './Features'
import Discover from './Discover'
import CallToAction from './CallToAction'
const Landing = () => {
  return (
    <div>
        <Hero></Hero>
        <Features></Features>
        <Discover></Discover>
        <CallToAction></CallToAction>
    </div>
  )
}

export default Landing
