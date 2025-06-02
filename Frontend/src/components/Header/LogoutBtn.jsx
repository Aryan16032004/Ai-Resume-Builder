import React from 'react';
import { useDispatch } from 'react-redux';
import { logout} from '../../store/authSlice';
import authService from '../../backend/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

function LogoutBtn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logoutHandler = async () => {
    try {
      await authService.logout(); 
      dispatch(logout());
      navigate("/login"); 
    } catch (error) {
      console.error("Logout failed:", error); 
    }
  };

  return (
    <Button
      onClick={logoutHandler}
    >
      Logout
    </Button>
  );
}

export default LogoutBtn;
