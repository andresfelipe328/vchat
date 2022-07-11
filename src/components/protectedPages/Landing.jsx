// React
import {useEffect, useRef, useState} from 'react'
import { /*Navigate,*/ Route, Routes } from 'react-router-dom'

// Components
import DMRoom from './dmRoom/DMRoom'
import DmMgmt from './dmRoom/DmMgmt'
import Activity from './activity/Activity'
import RoomMgmt from './room/RoomMgmt'
import Room from './room/Room'

// Animation
import {gsap, Back} from 'gsap'

const Landing = ({currRoom, setCurrRoom, currDmRoom, setCurrDmRoom}) => {
   const [roomInvitePopup, setRoomInvitePopup] = useState(false)
   const [pinnedMsgPopup, setPinnedMsgPopup] = useState(false)

   // Animation
   const friendMgmt = useRef()
   const activity = useRef()
   useEffect(() => {
      gsap.to (
         [friendMgmt.current, activity.current], {
            duration: .8,
            delay: .15,
            stagger: .2,
            x: 0,
            opacity: 1,
            ease: Back.easeOut.config(2)
         }
      )
   }, [])

   return (
      <div className="dmMgmt-activity-wrapper">
         <div className="dmMgmt-roomMgmt-container" ref={friendMgmt}>
            <Routes>
               <Route path='' element={
                  <DmMgmt 
                     currDmRoom={currDmRoom} 
                     setCurrDmRoom={setCurrDmRoom}
                  />}
               />
               <Route path={`/dmroom/${currDmRoom.dmRoomID}`} element={
                  <DmMgmt 
                     currDmRoom={currDmRoom} 
                     setCurrDmRoom={setCurrDmRoom}
                  />}
               />
               <Route path={`/room/${currRoom.roomID}/${currRoom.miniRoomID}`} element={
                  <RoomMgmt 
                     currRoom={currRoom} 
                     setCurrRoom={setCurrRoom}
                     roomInvitePopup={roomInvitePopup}
                     setRoomInvitePopup={setRoomInvitePopup}
                  />}
               />
               {/* <Route path="*" element={<Navigate to='/' />}/> */}
            </Routes>
         </div>
         <div className="activity-room-container" ref={activity}>
            <Routes>
               <Route path='' element={<Activity/>}/>
               <Route path={`/dmroom/${currDmRoom.dmRoomID}`} element={
                  <DMRoom 
                     currDmRoom={currDmRoom}
                     pinnedMsgPopup={pinnedMsgPopup}
                     setPinnedMsgPopup={setPinnedMsgPopup}
                  />}
               />
               <Route path={`/room/${currRoom.roomID}/${currRoom.miniRoomID}`} element={
                  <Room 
                     currRoom={currRoom}
                     roomInvitePopup={roomInvitePopup}
                     setRoomInvitePopup={setRoomInvitePopup}
                     pinnedMsgPopup={pinnedMsgPopup}
                     setPinnedMsgPopup={setPinnedMsgPopup}
                  />}
               />
               {/* <Route path="*" element={<Navigate to='/' />}/> */}
            </Routes>
         </div>
      </div>
   )
}

export default Landing