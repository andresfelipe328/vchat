// React
import { useRef, useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize';

import uuid from 'react-uuid';
import { UserAuth } from '../../../context/AuthContext';

// Components
import DmRoomInvite from './DmRoomInvite'
import PinnedMsgs from './PinnedMsgs';

// Icons
import {FaTrash, FaUserPlus, FaBell, FaTimes} from 'react-icons/fa'
import {AiFillPushpin, AiFillEdit, AiFillPicture} from 'react-icons/ai'
import {BiUpload, BiSearchAlt2} from 'react-icons/bi'
import {RiAddLine} from 'react-icons/ri'
import {BsFillTelephoneOutboundFill} from 'react-icons/bs'
import {MdOutlineAddReaction, MdOutlineReply, MdOutlineMoreHoriz} from 'react-icons/md'

// Animation
import {gsap, Back} from 'gsap'

const DMRoom = ({currDmRoom, pinnedMsgPopup, setPinnedMsgPopup}) => {
   const [msgImg, setMsgImg] = useState('')
   const [msgImgPopup, setMsgImgPopup] = useState(false)
   const [msg, setMsg] = useState('')
   const [replyPopup, setReplyPopup] = useState(false)
   const [replyTo, setReplyTo] = useState({})
   const [err, setErr] = useState('')
   const [dmRoomName, setDmRoomName] = useState()
   const [pinnedMsgs, setPinnedMsgs] = useState([])
   const [dmRoomInvitePopup, setDmRoomInvitePopup] = useState(false)

   const {userAuth, dmRoomData, uploadDmRoomMsg, deleteMsg, pinMsg} = UserAuth()

   // Animation
   const dmRoom = useRef()
   useEffect(() => {
      gsap.to (
         dmRoom.current, {
            duration: .8,
            y: 0,
            opacity: 1,
            ease: Back.easeOut.config(2)
         }
      )

      for (let i = 0; i < dmRoomData?.messages?.length; ++i) {
         const msg = dmRoomData?.messages[i]
         if (msg.pinned)
            setPinnedMsgs(prev => [...prev, msg])
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   const imgMsg = useRef()
   useEffect(() => {
      if (msgImgPopup) {
         gsap.to (
            imgMsg.current, {
               duration: .8,
               y: 0,
               opacity: 1,
               pointerEvents: 'all',
               display: 'flex',
               ease: Back.easeOut.config(2)
            }
         )
      }
      else {
         gsap.to (
            imgMsg.current, {
               duration: .2,
               y: -20,
               opacity: 0,
               pointerEvents: 'none',
               display: 'none'
            }
         )
         setMsgImg('')
         setMsg('')
      }
   }, [msgImgPopup])

   const reply = useRef()
   useEffect(() => {
      if (replyPopup) {
         gsap.to (
            reply.current, {
               duration: .8,
               y: 0,
               opacity: 1,
               pointerEvents: 'all',
               display: 'flex',
               ease: Back.easeOut.config(2)
            }
         )
      }
      else {
         gsap.to (
            reply.current, {
               duration: .2,
               y: -20,
               opacity: 0,
               pointerEvents: 'none',
               display: 'none'
            }
         )
      }
   }, [replyPopup])

   useEffect(() => {
      if (dmRoomData.participantsInfo.length <= 2)
        setDmRoomName(dmRoomData.participantsInfo.find(friend => friend.participantUsername !== userAuth.displayName).participantUsername)
      else {
         if(dmRoomData.dmRoomName.replace(` ${userAuth.displayName}`, '').replaceAll(' ', ', ').includes(userAuth.displayName))
           setDmRoomName(dmRoomData.dmRoomName.replace(`${userAuth.displayName} `, '').replaceAll(' ', ', '))
         else
            setDmRoomName(dmRoomData.dmRoomName.replace(` ${userAuth.displayName}`, '').replaceAll(' ', ', '))
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dmRoomData])

   const onEnterPress = async (e) => {
      if(e.keyCode === 13 && e.shiftKey === false) {
         e.preventDefault();

         const message = {
            msgID: msgImg ? msgImg.name.substring(msgImg.name.lastIndexOf('_') + 1) : uuid(),
            msgFile: msgImg && msgImgPopup ? msgImg : null,
            replyTo: replyTo.contents ? replyTo.contents : null,
            replyToFile: replyTo.fileContents ? replyTo.fileContents :null,
            msg: msg 
         }
         await uploadDmRoomMsg(message, currDmRoom.dmRoomID)
         setMsg('')
         setMsgImg('')
         setReplyTo({})
         msgImgPopup && setMsgImgPopup(!msgImgPopup)
         replyPopup && setReplyPopup(!replyPopup)
      }
   }

   const handleAddFile = (e) => {
      e.target.value=""
      setErr('')
   }

   // Resize User Avatar
   const resizeImg = (e) => {
      const imgFile = e.target.files[0]
      const msgID = uuid()
      
      if (!imgFile.name.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG|gif|mp3|mp4)$/)) {
         setErr('Please select valid image JPG,JPEG,PNG, GIF');
            return false;
      }

      else if (imgFile.name.match(/\.(gif|mp4|mp3)$/)) {
         const file = new File([imgFile], `message_${userAuth.uid}_${currDmRoom.roomID}_${msgID}`, {
            type: imgFile.type,
            lastModified: Date.now()
         });

         setMsgImg(file)
         setMsgImgPopup(!msgImgPopup)
      }

      else {
         let reader = new FileReader();
         reader.onload = (e) => {
         const img = new Image();
         img.onload = () => {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            var MAX_WIDTH = 250;
            var MAX_HEIGHT = 250;
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
            const file = new File([blob], `message_${userAuth.uid}_${currDmRoom.roomID}_${msgID}`, {
               type: imgFile.type,
               lastModified: Date.now()
            });
            setMsgImg(file)
            }, imgFile.type, 1);
         };
         setMsgImgPopup(!msgImgPopup)
         img.onerror = () => {
               console.log('Invalid image content.');
            return false;
         };
         //debugger
         img.src = e.target.result;
         };
         reader.readAsDataURL(imgFile);
      }

      document.getElementById("msg-input").focus()
   }

   const handleDeleteDmMsg = async (msg) => {
      await deleteMsg(msg, currDmRoom.dmRoomID, 'dmRoom')
   }

   const handlePinMsg = async (msg) => {
      await pinMsg(msg, currDmRoom.dmRoomID, 'dmRoom')
      setPinnedMsgs(prev => [...prev, msg])
   }

   const handleReplyTo = (msg) => {
      let replyMsg = ''
      let replyImgMsg = false

      if (msg.message.length > 0)
         replyMsg = msg.message.length < 24 ? msg.message : msg.message.substring(0,24) + '...'
      if (msg.messageFile)
         replyImgMsg = true

      setReplyPopup(!replyPopup)
      setReplyTo({
         replyTo: msg.authorName,
         replyMsgID: msg.msgID,
         contents: msg.authorName + ': ' + replyMsg,
         fileContents: replyImgMsg
      })
   }

   const handleCloseReplyPopup = () => {
      setReplyPopup(!replyPopup)
      setReplyTo('')
   }

   return (
      <div className="dmRoom-wrapper" ref={dmRoom}>
         <div className="msgHeadMenu-wrapper">
            <ul className="msgHead-menu">
               <div className="msgHeadMenu-group">
                  <li className="menu-item">
                     <button className="item-btn notification">
                        <FaBell className='item-icon notification-icon'/>
                     </button>
                  </li>
                  <li className="menu-item">
                     <button className="item-btn">
                        <BsFillTelephoneOutboundFill className='item-icon'/>
                     </button>
                  </li>
                  <li className="menu-item">
                     <button className="item-btn" onClick={() => setPinnedMsgPopup(!pinnedMsgPopup)}>
                        <AiFillPushpin className='item-icon'/>
                     </button>

                     <PinnedMsgs
                        currDmRoom={currDmRoom}
                        pinnedMsgs={pinnedMsgs}
                        setPinnedMsgs={setPinnedMsgs}
                        pinnedMsgPopup={pinnedMsgPopup}
                        setPinnedMsgPopup={setPinnedMsgPopup}
                     />
                  </li>
                  <li className="menu-item">
                     <button className="item-btn" onClick={() => setDmRoomInvitePopup(!dmRoomInvitePopup)}>
                        <FaUserPlus className='item-icon'/>
                     </button>
                  </li>
               </div>
               <li className="menu-item">
                  <div className="form-wrapper">
                     <form className="msgSearch-form">
                        <input
                        type="text" 
                        className="msgSearch-input"
                        placeholder='search...'
                        />
                     </form>
                     <BiSearchAlt2 className='search-icon'/>
                  </div>
               </li>

               <DmRoomInvite
               dmRoomInvitePopup={dmRoomInvitePopup}
               setDmRoomInvitePopup={setDmRoomInvitePopup}
               />
            </ul>
         </div>
         
         <div className="dmMsg-container">
            <ul className="msg-list">
               <li className="msg-container">
                  <div className="msg-head">
                     <div className="msgHead-main">
                        <div className="dmIcon-wrapper">
                           <div src="" alt="" className="dm-icon" style={{backgroundColor: currDmRoom.dmRoomIcon}}/>
                        </div>
                        <h2 className='dmRoom-participants'>
                           {dmRoomName}
                        </h2>
                     </div>
                     <h5 className='subinfo'>
                        Welcome to the beginning of the {dmRoomName} dm room
                     </h5>
                  </div>

                  <ul className="msg-contents">
                  {dmRoomData?.messages?.map((msgContent) => {
                     return (
                        <li key={msgContent.msgID} className={`msg-wrapper ${msgContent.authorName === replyTo.replyTo && 'curr-reply'}`}>
                           { msgContent.reply 
                              &&
                              <div className='reply-p'>
                                 @{msgContent.reply}
                                 { msgContent.replyFile 
                                    &&
                                       <AiFillPicture className='reply-imgFile'/>
                                 }
                              </div>
                           }
                           <div className="msg-subHead">
                              <img src={msgContent.authorIcon} alt="user icon" className="dm-icon" />
                              <div className="msgSubHead-id">
                                 <p className='msg-author'>{msgContent.authorName}</p>
                                 -<small className='msg-date'>{msgContent.timestamp}</small>-
                              </div>
                           </div>
                           {msgContent.messageFile 
                           && 
                              <img className='msg-file' src={msgContent.messageFile} alt="msg file" />   
                           }
                           <p className="msg">
                              {msgContent.message}
                           </p>

                           <ul className="msg-menu">
                              <li className="reaction">
                                 <button className="reaction-btn">
                                    <MdOutlineAddReaction className='reaction-icon'/>
                                 </button>
                              </li>
                              <li className="reply">
                                 <button className="reply-btn" onClick={() => handleReplyTo(msgContent)}>
                                    <MdOutlineReply className='reply-icon'/>
                                 </button>
                              </li>
                              <li className="more">
                                 <button className="more-btn">
                                    <MdOutlineMoreHoriz className='more-icon'/>
                                 </button>
                                 <ul className="more-menu" style={{display: (msgContent.authorName !== userAuth.displayName && msgContent.pinned) && 'none' , bottom: (msgContent.authorName !== userAuth.displayName && !msgContent.pinned) ? -3.25 + 'rem' : (msgContent.authorName === userAuth.displayName && msgContent.pinned) && -3.25 + 'rem'}}>
                                    { !msgContent.pinned &&
                                       <li className="menu-item">
                                          <button className="item-btn" onClick={() => handlePinMsg(msgContent)}>
                                             <AiFillPushpin className='item-icon'/>
                                             <p>Pin</p>
                                          </button>
                                       </li>
                                    }
                                    {userAuth.uid === msgContent.authorID && 
                                       <li className="menu-item delete">
                                          <button className="item-btn" onClick={() => handleDeleteDmMsg(msgContent)}>
                                             <FaTrash className='delete-icon'/>
                                             <p>delete message</p>
                                          </button>
                                       </li>
                                    }
                                 </ul>
                              </li>
                           </ul>
                        </li>
                     )
                  })}
                  </ul>
               </li>
            </ul>
         </div>
         
         <form className="dmMsgform-wrapper">
            <div className="replyTo-container" ref={reply}>
               <div className='reply-to'>
                  <p>Replying to - {replyTo.contents}</p>
                  { replyTo.fileContents
                     &&
                        <AiFillPicture className='reply-imgFile'/>
                  }
               </div>
               <button type='button' className='replyDelete-btn' onClick={handleCloseReplyPopup}>
                  <FaTimes className='replyDelete-icon'/>
               </button>
            </div>

            <div className="msgImg-wrapper" ref={imgMsg}>
               <div className="msgImg-container">
                  <img 
                     className='msg-img' 
                     src={msgImg && URL.createObjectURL(msgImg)} alt="msg file" 
                  />

                  <div className="img-menu">
                     <button type='button' className='imgDelete-btn' onClick={() => setMsgImgPopup(!msgImgPopup)}>
                        <FaTrash className='imgDelete-icon'/>
                     </button>
                     <button type='button' className='imgEdit-btn'>
                        <AiFillEdit className='imgEdit-icon'/>
                     </button>
                  </div>
               </div>
            </div>

            { err
               &&
                  <p className='msgFile-error'>{err}</p>
            }

            <div className="dmMsgInput-wrapper">
               <label htmlFor="dmMsgImg-input" className="addFile-btn">
                  <BiUpload className='addFile-icon'/>
               </label>
               <input
                  onChange={resizeImg}
                  onClick={(e) => handleAddFile(e)}
                  type='file'
                  style={{display: 'none'}}
                  id ='dmMsgImg-input'
                  required
               />
               <TextareaAutosize
                  className='dmMsg-input'
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={onEnterPress}
                  value={msg}
                  placeholder='message...' 
               />
               <button type='button' className="addEmoji-btn">
                  <RiAddLine className='addEmoji-icon' style={{color: 'wheat'}}/>
               </button>
            </div>
         </form>
      </div>
   )
}

export default DMRoom