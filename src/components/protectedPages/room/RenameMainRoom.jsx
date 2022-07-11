// React
import { useState, useEffect, useRef } from 'react'

import { UserAuth } from '../../../context/AuthContext'

// Icon
import {TiArrowSortedUp} from 'react-icons/ti'

// Animation
import {gsap, Back} from 'gsap'

const RenameMainRoom = ({renameMainRoomPopup, setRenameMainRoomPopup, prevMainRoomName, currRoom}) => {
   const [newMainRoomName, setNewMainRoomName] = useState('')
   const {renameMainRoom} = UserAuth()

   // Animation
   const renamePopup = useRef()
   useEffect(() => {
      if (renameMainRoomPopup)
         gsap.to (
            renamePopup.current, {
               duration: .8,
               y: 0,
               opacity: 1,
               zIndex: 25,
               pointerEvents: 'all',
               ease: Back.easeOut.config(2)
            }
         )
      else {
         setNewMainRoomName('')
         gsap.to (
            renamePopup.current, {
               duration: .2,
               y: -50,
               opacity: 0,
               zIndex: -1,
               pointerEvents: 'none'
            }
         ) 
      }
   }, [renameMainRoomPopup])

   // Handle Main Room Rename
   const handleRenameMainRoom = async (e) => {
      e.preventDefault()
      await renameMainRoom(prevMainRoomName, newMainRoomName, currRoom.roomID)
      setRenameMainRoomPopup(!renameMainRoomPopup)
   }

   return (
      <div className="renameMainRoomPopup" ref={renamePopup}>
         <button className='closePopup-btn' onClick={() => setRenameMainRoomPopup(!renameMainRoomPopup)}>
            <TiArrowSortedUp className='close-popup'/>
         </button>
         <form className="renameMainRoom-form" onSubmit={handleRenameMainRoom}>
            <p className="renameMainRoom-title">Rename Main Room</p>
            <input 
               type="text"
               className="renameMainRoom-input"
               value={newMainRoomName}
               onChange={(e) => setNewMainRoomName(e.target.value)}
               placeholder={prevMainRoomName}
            />
            <button className="renameMainRoom-btn">Rename</button>
         </form>

      </div>
   )
}

export default RenameMainRoom