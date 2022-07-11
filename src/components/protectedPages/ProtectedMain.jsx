import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import Landing from './Landing'

const ProtectedMain = ({currRoom, setCurrRoom, currDmRoom, setCurrDmRoom}) => {
   return (
      <section className="home-container">
         <Routes>
            <Route path='/*' element={<Landing currRoom={currRoom} setCurrRoom={setCurrRoom} currDmRoom={currDmRoom} setCurrDmRoom={setCurrDmRoom}/>}/>
            <Route path="*" element={<Navigate to='/' />}/>
         </Routes>
      </section>
   )
}

export default ProtectedMain