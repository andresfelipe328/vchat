import {useState, useRef, useEffect} from 'react'

// Icon
import {FaTimes} from 'react-icons/fa'

// Animation
import {gsap, Back} from 'gsap'

const Emoji = ({msg, setMsg, emojiPopup, setEmojiPopup}) => {
   const [emojis, setEmojis] = useState([])
   const [searchEmoji, setSearchEmoji] = useState('')

   // Animation
   const emoji = useRef()
   useEffect(() => {
      if (emojiPopup) {
         gsap.to (
            emoji.current, {
               duration: .8,
               y: 0,
               opacity: 1,
               pointerEvents: 'all',
               display: 'grid',
               ease: Back.easeOut.config(2)
            }
         )
      }
      else {
         gsap.to (
            emoji.current, {
               duration: .2,
               y: -20,
               opacity: 0,
               pointerEvents: 'none',
               display: 'none'
            }
         )
         setSearchEmoji('')

      }
   }, [emojiPopup])

   // Fetch Emojis
   useEffect(() => {
      fetch(process.env.REACT_APP_EMOJIAPI)
      .then((response) => response.json())
      .then(setEmojis)
   }, [])

   const handleSelectEmoji = (emojiObj) => {
      setMsg(msg + emojiObj.character)
   }
  
   return (
      <div className="emoji-wrapper" ref={emoji}>
         <button type='button' className='close-emoji' onClick={() => setEmojiPopup(!emojiPopup)}>
            <FaTimes className='close-icon'/>
         </button>

         <input 
            type="text" 
            className='search-emoji'
            placeholder='search for an emoji...'
            onChange={(e) => setSearchEmoji(e.target.value)}
         />

         {
            emojis?.filter((search) => {
               if (searchEmoji === '') {
                  return search
               }
               else if (search.slug.toLowerCase().includes(searchEmoji.toLowerCase())) {
                  return search
               }
               return null

               }).map((emoji) => {
                  return (
                     <button type='button' key={emoji.slug} className="emoji" onClick={() => handleSelectEmoji(emoji)}>
                        {emoji.character}
                     </button>
                  )
               })
         }
      </div>
   )
}

export default Emoji