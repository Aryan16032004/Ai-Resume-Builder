import { Briefcase, IndianRupee, Star, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { toast,Toaster } from 'sonner';
import axios from 'axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useState } from 'react';

export default function ProfileCard({ profile }) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:8000/api/interview/${profile._id}`, {
        withCredentials: true
      });
      
      toast.success("Profile deleted successfully");
      window.location.reload()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete profile");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
         <CardHeader className="flex-row items-center justify-between p-4">
          <div className="flex items-center space-x-3">
             <Toaster expand richColors />
            <div className="bg-indigo-500 rounded-md p-2">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{profile.name}</CardTitle>
              <CardDescription>{profile.jobProfile}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 pb-2" onClick={() => navigate(`/profile/${profile._id}`)}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <IndianRupee className="h-4 w-4 mr-1" />
              <span className="text-sm">{profile.salary} LPA</span>
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-full ${getDifficultyColor(profile.difficulty)}`}>
              {profile.difficulty}
            </span>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Skills</h4>
            <div className="flex flex-wrap gap-1">
              {profile.skills.slice(0, 5).map((skill, index) => (
                <span key={index} className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {skill}
                </span>
              ))}
              {profile.skills.length > 5 && (
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                  +{profile.skills.length - 5}
                </span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-3 flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <Star className="h-4 w-4 mr-1 text-yellow-400" />
            <span>New</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={handleDeleteClick}
              >
                Delete Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the interview profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}