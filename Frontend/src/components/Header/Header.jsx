import React from 'react'
import { Button } from '../ui/button'
import  Logo  from './Logo'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LogoutBtn from './LogoutBtn.jsx'

function Header() {

  const authStatus = useSelector((state) => state.auth.status);

  return (
    <header>
        <nav className='w-full flex justify-between items-center p-4 shadow-md bg-white'>
          <Logo size="lg" />
      
           {
            authStatus?(
              <>
              <div className='flex gap-3' >
                <Button asChild variant="link">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild variant="link"> 
                  <Link to="/templates">Resume Templates</Link>
                </Button>
                <Button asChild variant="link"> 
                  <Link to="/ai-interview">Ai Interview</Link>
                </Button>
              </div>
              <div >
                <LogoutBtn/>
              </div>
              </>
              
            ):
            (
              <div className='flex gap-4'>
               <Button asChild variant="outline">
              <Link to="/register">Sign Up</Link>
            </Button>

            <Button asChild variant="outline">
              <Link to="/login">Sign In</Link>
            </Button>
              </div>
            )
           }
         </nav>
    </header>
    
  )
}

export default Header
