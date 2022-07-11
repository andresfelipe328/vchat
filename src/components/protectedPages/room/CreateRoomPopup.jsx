// React
import { useRef, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { UserAuth } from "../../../context/AuthContext"

// Icons
import { FaTimes } from "react-icons/fa"
import { BsCameraFill } from "react-icons/bs"
import defaultRoom from '../../../static/img/icons/room-placeholder.svg'

// Animation
import {gsap, Power3, Back} from 'gsap'


const CreateRoomPopup = ({createRoomPopup, setCreateRoomPopup}) => {
   const {createUserRoom, userAuth} = UserAuth()
   const [err, setErr] = useState('')
   const [roomImg, setRoomImg] = useState('')
   const [roomCategory, setRoomCategory] = useState('')
   const [roomName, setRoomName] = useState('')

   // Animation
   const createRoomWrapper = useRef()
   const createRoom = useRef()
   useEffect(() => {
      if (createRoomPopup) {
         gsap.to(
            createRoomWrapper.current, {
               duration: .3,
               opacity: 1,
               zIndex: 5,
               y: 0,
               ease: Back.easeOut.config(2)
            }
         )
         gsap.to(
            createRoom.current, {
               duration: .3,
               opacity: 1,
               delay: .2,
               y: 0,
               ease: Back.easeOut.config(2)
            }
         )
      }
      else {
         setRoomImg('')
         setRoomCategory('')
         setRoomName('')
         setErr('')
         gsap.to(
            createRoom.current, {
               duration: .3,
               opacity: 0,
               y: 20,
               ease: Back.easeOut.config(2)
            }
         )
         gsap.to(
            createRoomWrapper.current, {
               duration: .2,
               opacity: 0,
               delay: .2,
               zIndex: -1,
               y: 20,
               ease: Power3.easeOut
            }
         )
      }
   }, [createRoomPopup])

   const nav = useNavigate()
   useEffect(() => {
      if (!userAuth.displayName || !userAuth.photoURL) {
         console.log('enter')
         nav('/register/part-two')
      }
      else
         nav('/')
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   // Resize Image
   const resizeImg = (e) => {
      const imgFile = e.target.files[0]
      if (!imgFile.name.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG|gif)$/)) {
         console.log('Please select valid image JPG,JPEG,PNG, GIF');
      }
      else {
         let reader = new FileReader();
         
         reader.onload = (e) => {
         const img = new Image();
         img.onload = () => {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            var MAX_WIDTH = 350;
            var MAX_HEIGHT = 350;
            var width = img.width;
            var height = img.height;

            if (width > height) {
               if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
               }
            } else {
               if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
               }
            }
            canvas.width = width;
            canvas.height = height;
            ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            ctx.canvas.toBlob((blob) => {
            const file = new File([blob], 'serverIcon', {
               type: 'image/jpeg',
               lastModified: Date.now()
            });
            setRoomImg(file)
            }, 'image/jpeg', 1);
         };

         img.onerror = () => {
            console.log('Invalid image content');
         };
         //debugger
         img.src = e.target.result;
         };
         reader.readAsDataURL(imgFile);
      }
   }

   // HandleSubmit
   const handleCreateRoom = async (e) => {
      e.preventDefault()
      try {
         const res = await createUserRoom(roomCategory, roomName, roomImg)
         if (res.status) {
            setCreateRoomPopup(!createRoom)
            setRoomImg('')
            setRoomCategory('')
            setRoomName('')
         }
         else {
            setErr(res.message)
            return
         }
      } catch(err) {
         console.log(err)
         setErr(err.message)
         return
      }
   }

   return (
      <div className="createRoom-wrapper" ref={createRoomWrapper}>
         <div className="createRoom-container" ref={createRoom}>
            <button className="close" onClick={() => setCreateRoomPopup(!createRoomPopup)}><FaTimes className="close-icon"/></button>
            <div className="createRoom-head">
               <h3 className="createRoom-title">
                  Create a Room
               </h3>
               <p className="createRoom-p">Your room is where you and<br/>your friends chat and talk</p>
            </div>
            {err && <p className='err-msg'>{err}</p>}
            <form className="createRoom-form" onSubmit={handleCreateRoom} autoComplete="off">
               <div className="roomImg-wrapper">
                  <div className="roomImg-container">
                     <img className='room-img' src={roomImg ? URL.createObjectURL(roomImg) : defaultRoom} alt="default room icon" />
                     <label className='roomImg-input' htmlFor="roomImg-input">
                        <BsCameraFill className='img-input'/>
                     </label>
                  </div>

                  <input
                     onChange={resizeImg}
                     style={{display: 'none'}}
                     id ='roomImg-input'
                     type="file"
                     required
                  />
               </div>

               <label className="createRoom-label" htmlFor="category">Category:</label>
               <input
                  onChange={(e) => setRoomCategory(e.target.value.toLowerCase())}
                  className="createRoom-input"
                  placeholder="category"
                  value={roomCategory}
                  type="text" 
                  name="category"
                  required
               />
               
               <label className="createRoom-label" htmlFor="name">Room Name:</label>
               <input
                  onChange={(e) => setRoomName(e.target.value.toLowerCase())}
                  className="createRoom-input"
                  placeholder="room name"
                  value={roomName}
                  type="text" 
                  name="name"
                  required
               />
               <button disabled={!roomImg || !roomName  ? true : false} className="createRoom-btn">Create</button>
            </form>
         </div>
      </div>
   )
}

export default CreateRoomPopup