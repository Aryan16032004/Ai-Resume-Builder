import { useState,useEffect } from 'react'
import Header from './components/Header/Header'
import { Button } from './components/ui/button'
import { Link, Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login, logout } from './store/authSlice'
import authService from './backend/auth'

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    authService.getCurrentUser()
    .then((userData) => {
      if (userData) {
        dispatch(login({userData:userData.user}))
      } else {
        dispatch(logout())
      }
    })
    .finally(() => setLoading(false))
  }, [])

  return !loading?(
    <>
      <header className="sticky top-0 z-50">
        <Header />
      </header>
      
      <Outlet/>
    </>
  ):null
}

export default App