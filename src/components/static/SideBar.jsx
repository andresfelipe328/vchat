// React
import { useEffect, useRef, useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'

// Icons
import logo from '../../static/img/icons/app-icon.svg'
import {BsPlusLg} from 'react-icons/bs'
import {DiCompass} from 'react-icons/di'
import {GoPrimitiveDot} from 'react-icons/go'
import {GiNightSleep, GiCancel} from 'react-icons/gi'
import {AiFillEyeInvisible} from 'react-icons/ai'
import {RiLoginCircleFill, RiLogoutCircleFill} from 'react-icons/ri'
import loading from '../../static/img/icons/loading.gif'

// Animation
import {gsap, Back} from 'gsap'
import { UserAuth } from '../../context/AuthContext'

const STATUS_COLOR = [
   {status: "active", color: "#378139"},
   {status: "idle", color: "#FFAD27"},
   {status: "busy", color: "#b30f0f"},
   {status: "invisible", color: "#606A6D"}
]

const SideBar = ({createRoomPopup, setCreateRoomPopup, currRoom, setCurrRoom}) => {

   const [selected, setSelected] = useState('');
   const {userAuth, logout, changeStatus, status, userServers, getRoomData, setRoomData, setCurrMiniRoomData, setDmRoomData, getMiniRoomData} = UserAuth()
   const navigate = useNavigate()

   // Animation 
   const sidebar = useRef()
   useEffect(() => {
      gsap.to(
         sidebar.current, {
            duration: .8,
            opacity: 1,
            x: 0,
            ease: Back.easeOut.config(2)
         }
      )
      // var _lsTotal=0,_xLen,_x;for(_x in localStorage){ if(!localStorage.hasOwnProperty(_x)){continue;} _xLen= ((localStorage[_x].length + _x.length)* 2);_lsTotal+=_xLen; console.log(_x.substr(0,50)+" = "+ (_xLen/1024).toFixed(2)+" KB")};console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");
   }, [])

   useEffect(() => {
      if (localStorage.getItem('currRoom')) {
         const currRoom = JSON.parse(localStorage.getItem('currRoom'))
         setSelected(currRoom.roomName)
         setCurrRoom(currRoom)
      }
      else {
         navigate('/')
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   useEffect(() => {
      if (!currRoom)
         setSelected('')
   }, [currRoom])

   // UpdateStatus
   const getStatusColor = () => {
      const statusColor = STATUS_COLOR.find(data => data.status === status)
      return statusColor?.color
   }

   // Toggle Rooms
   const toggleSelected = (room) =>  {
      const roomInfo = {
         roomName: room.name,
         roomIcon: room.roomIcon,
         roomIconID: room.roomIconID,
         roomID: room.roomID,
         miniRoomID: room.miniRoomID
      } 
      localStorage.setItem('currRoom', JSON.stringify(roomInfo))
      setSelected(room.name);
   }

   // Handle Current Room
   const handleCurrRoom = async (room) => {
      setCurrRoom({
         roomName: room.name,
         roomIcon: room.roomIcon,
         roomIconID: room.roomIconID,
         roomID: room.roomID,
         miniRoomID: room.miniRoomID
      })
      toggleSelected(room)

      localStorage.removeItem('currMiniRoomData')
      await getMiniRoomData(room.roomID, room.miniRoomID)

      if(!localStorage.getItem('currRoomData'))
         await getRoomData(room.roomID)



      navigate(userAuth?.displayName ? `room/${room.roomID}/${room.miniRoomID}` : "/register/part-two")
   }

   // Handle to Home
   const handleToHome = () => {
      setSelected('')
      localStorage.removeItem('currRoom')
      localStorage.removeItem('currRoomData')
      localStorage.removeItem('currMiniRoomData')
      localStorage.removeItem('currDmRoom')
      setCurrRoom({})
      setRoomData({})
      setDmRoomData({})
      setCurrMiniRoomData({})
   }

   // HandleLogout
   const handleLogout = async () => {
      try {
         await logout()
         localStorage.clear()
         navigate('/')
      } catch (e) {
         console.log('Error: ', e.message)
      }
   }

   // useEffect(() => {
   //    const updateRoomData = async () => {
   //       if (!localStorage.getItem('currRoomData')) {
   //          await getRoomData(currRoom.roomName, currRoom.roomID, currRoom.miniRoomID)
   //       }
   //       else {
   //          const prevRoomID = JSON.parse(localStorage.getItem('currRoomData')).roomID
   //          const newRoomID = currRoom.roomID

   //          if (prevRoomID !== newRoomID) {
   //             await getRoomData(currRoom.roomID)
   //          }
   //       }
   //    }
   //    updateRoomData()
   //    // eslint-disable-next-line react-hooks/exhaustive-deps
   // } ,[currRoom])

   useEffect(() => {
      if (!userAuth)
         setSelected('')
   }, [userAuth])

   return (
      <section className='sidebar-container' ref={sidebar}>
         <div className="sidebar-wrapper">

            <div className="head">
               <h4 className='app-title'>vchat</h4>
               <Link to={((userAuth?.displayName || userAuth?.photoURL) || !userAuth) ? '' : '/register/part-two'} onClick={handleToHome} className='toHome-link sidebar-icon'>
                  <img src={logo} alt="app icon" className='app-logo'/>
               </Link>
            </div>

            <div className="roomListing-container">
               <ul className="room-listing">
                  {userServers?.map((room) => {
                     return (
                        <li key={room.roomID} className="room">
                           <button onClick={() => handleCurrRoom(room)} className='room-link'>
                              <img src={room.roomIcon} alt="server Icon" className='room-icon'/>
                           </button>
                           <span className={`current ${selected === room.name && 'curr'}`}></span>
                        </li>
                     )
                  })}                                                              
               </ul>
            </div>

            <div className="user-container">
            {(userAuth?.displayName || userAuth?.photoURL) && 
               <>
               <li className="link link-create">
                  <button href="room" className="create" onClick={() => setCreateRoomPopup(!createRoomPopup)}>
                     <BsPlusLg className='create-icon'/>
                  </button>
               </li>
               <li className="link">
                  <a href="room" className="navigate">
                     <DiCompass className='navigate-icon'/>
                  </a>
               </li>
               </>
               }
               {!userAuth
                  ?
                  <Link to="login" className='login-link'>
                     <RiLoginCircleFill className='login-icon'/> 
                  </Link>
                  :
                  <ul className="userStatus-list">
                     <li className='userStatus-btn'>
                        {!userAuth.displayName || !userAuth.photoURL
                        ?
                           <button className="user-btn">
                              <img className='loading-icon' src={loading} alt="loading" />
                           </button>
                        :
                           <button className="user-btn">
                              <img className='user-icon' src={userAuth.photoURL} alt="user icon"/>
                              <span className='status-indicator' style={{backgroundColor: getStatusColor()}}></span>
                           </button>
                        }
                        <ul className="status-list">
                           <li className='status'>
                              <button onClick={async () => await changeStatus("active")} 
                              className='status-btn on'>
                                 <GoPrimitiveDot style={{color: '#378139'}} className='status-icon'/>
                                 Online
                              </button>
                           </li>
                           <li className='status'>
                              <button onClick={async () => await changeStatus("idle")}className='status-btn idle'>
                                 <GiNightSleep style={{color: '#FFAD27'}} className='status-icon'/>
                                 Idle
                              </button>
                           </li>
                           <li className='status'>
                              <button onClick={async () => await changeStatus("busy")} className='status-btn busy'>
                                 <GiCancel style={{color: '#b30f0f'}} className='status-icon'/>
                                 Busy
                              </button>
                           </li>
                           <li className='status'>
                              <button onClick={async () => await changeStatus("invisible")} className='status-btn invisible'>
                                 <AiFillEyeInvisible style={{color: '#606A6D'}} className='status-icon'/>
                                 Invisible
                              </button>
                           </li>
                           <li className='status logout'>
                              <button onClick={handleLogout} className='status-btn logout-btn'>
                                 <RiLogoutCircleFill className='status-icon logout-icon'/>
                                 Logout
                              </button>
                           </li>
                        </ul>
                     </li>
                  </ul>
               }
            </div>

         </div>
      </section>
   )
}

export default SideBar