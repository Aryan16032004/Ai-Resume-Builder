
import axios from 'axios';
import { toast, Toaster } from 'sonner';

// Use Vite environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class AuthService{

    async register({ name, email, password }) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/users/register`,
                { name, email, password },
                { withCredentials: true }
            );
            return response;
        } catch (error) {
            toast.error("Registration failed. Please try again.");
            console.log("register :: error", error);
        }
    }

    async getCurrentUser() {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/users/currentUser`,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            console.log("getCurrentUser :: error", error);
        }
        return null;
    }

    async login({ email, password }) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/users/login`,
                { email, password },
                { withCredentials: true }
            );
            return response;
        } catch (error) {
            toast.error("Login failed. Please check your credentials.");
            console.log("login :: error", error);
        }
    }

    async logout() {
        try {
            await axios.post(
                `${API_BASE_URL}/api/users/logout`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            toast.error("Logout failed. Please try again.");
            console.log("logout :: error", error);
        }
    }
}

const authService = new AuthService();
export default authService;