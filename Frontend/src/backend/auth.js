import axios from 'axios';
import {toast,Toaster} from 'sonner'

export class AuthService{

    async register({name,email, password}) {
        try {
            const response = await axios.post('http://localhost:8000/api/users/register',
            { name,email, password },
            { withCredentials: true } 
            );

    //   console.log(response);
      return response
      
        } catch (error) {
            toast.error("Registration failed. Please try again.");
            console.log("register :: error", error);
            
        }
    }

    async getCurrentUser() {
        try {
            const response= await axios.get('http://localhost:8000/api/users/currentUser', {
        withCredentials: true, 
        })
        // console.log(response.data);
        
        return response.data;
        } catch (error) {
            console.log("getCurrentUser :: error", error);
        }

        return null;
    }

    async login({email, password}) {
        try {
            const response = await axios.post('http://localhost:8000/api/users/login',
            { email, password },
            { withCredentials: true } 
            );

    //   console.log(response);
      return response
      
        } catch (error) {
            toast.error("Login failed. Please check your credentials.");
            console.log("login :: error", error);
            
        }
    }

    async logout() {

        try {
            await axios.post('http://localhost:8000/api/users/logout', {}, {
            withCredentials: true,
            });

        } catch (error) {
            toast.error("Logout failed. Please try again.");
            console.log("logout :: error", error);
        }
    }
}

const authService = new AuthService();
export default authService;