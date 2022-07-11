// React
import { useEffect, useRef } from 'react'

import { UserAuth } from '../../../context/AuthContext'

// Animation
import {gsap, Back} from 'gsap'

// Icons
import {FaCheckCircle, FaTimesCircle, FaUserTimes} from 'react-icons/fa'
import {MdOutlinePendingActions} from 'react-icons/md'
import noRequests from '../../../static/img/icons/noRequests.svg'

const FriendsRequests = ({activityPage}) => {
   const {friendRequests, completeFriendRequest, deleteRequest} = UserAuth()

   const requests = useRef()
   useEffect(() => {
      gsap.to (
         requests.current, {
            duration: .8,
            y: 0,
            opacity: 1,
            delay: .15,
            ease: Back.easeOut.config(2)
         }
      )
   }, [activityPage])

   // handle Request
   const handleRequest = async (request, response) => {
      await completeFriendRequest(request, response)   
   }

   return (
      <div className="activity-contents" ref={requests}>
         <div className="request-wrapper">
            {
               (friendRequests?.received?.length > 0) && 
               <div className="received">
                  <h3 className="received-title">Requests Received</h3>
                  <ul className="received-list">
                     {friendRequests?.received?.map((request, i) => {
                        return (
                           <li className="received-request" key={i}>
                              <button className='requester'>
                                 <img src={request.requesterIcon} alt="user icon" className='requester-icon'/>
                                 <p className='username'>{request.requester}</p>
                              </button>

                              <p className='request-date'>{request.timestamp.substring(0, request.timestamp.indexOf(","))}</p>

                              <p className='request-msg'>{request.requestMsg}</p>

                              <div className="request-btns">
                                 <button className='accept-btn' onClick={() => handleRequest(request, 'accept')}>
                                    <FaCheckCircle className='accept-icon'/>
                                 </button>
                                 <button className='decline-btn' onClick={() => handleRequest(request, 'decline')}>
                                    <FaTimesCircle className='decline-icon'/>
                                 </button>
                              </div>
                           </li>
                        )
                     })}
                  </ul>
               </div>
            }

            {
               (friendRequests?.sent?.length > 0) &&
               <div className="sent">
                  <h3 className="received-title">Requests Sent</h3>
                  <ul className="sent-list">
                     {friendRequests?.sent?.map((request, i) => {
                        return (
                           <li className="sent-request" key={i}>
                              <button className='requestee'>
                                 <img src={request.requesteeIcon} alt="user icon" className='requestee-icon'/>
                                 <p className='username'>{request.requestee}</p>
                              </button>

                              <p className='request-date'>{request.timestamp.substring(0, request.timestamp.indexOf(","))}</p>

                              <p className='request-msg'>{request.requestMsg}</p>

                              {
                                 request.status === 'pending'
                                 ?
                                    <MdOutlinePendingActions className='pending-icon'/>
                                 :
                                    <button className="delete-request" onClick={async () => await deleteRequest(request, 'decline')}>
                                       <FaUserTimes className='requestDeclined-icon'/>
                                    </button>
                              }
                              
                           </li>
                        )
                     })}
                  </ul>
               </div>
            }

            {
               (friendRequests?.sent?.length < 1 && friendRequests?.received?.length < 1) &&
               <div className="noRequest-wrapper">
                  <img className='no-requests-img' src={noRequests} alt="no requests"/>
                  <p className='no-requests-p'>- It looks like there is nothing here -</p>
               </div>
            }
            
         </div>
      </div>
   )
}

export default FriendsRequests