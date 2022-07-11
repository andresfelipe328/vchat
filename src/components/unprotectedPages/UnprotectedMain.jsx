// React
import {Navigate, Route, Routes} from 'react-router-dom'

// Comonents
import Landing from './Landing';
import Login from './Login';
import Register from './Register';

const UnprotectedMain = () => {
   return (
      <section className="auth-wrapper">
         <Routes>
            <Route path='' element={<Landing/>}/>
            <Route path='login' element={<Login/>}/>
            <Route path='register/part-one' element={<Register/>}/>
            <Route path="*" element={<Navigate to='/' />}/>
         </Routes>
      </section>
   )
}

export default UnprotectedMain