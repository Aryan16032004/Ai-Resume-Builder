import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ellipsis, Download, Trash2, Plus, FileText } from 'lucide-react'
import resumeService from '../../backend/resume'
import { Toaster, toast } from 'sonner'
import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"


function Dashboard() {
  const [resumes, setResumes] = useState([])
  const [newResumeName, setNewResumeName] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resumeToDelete, setResumeToDelete] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchResumes = async () => {
      setLoading(true)
      try {
        const response = await resumeService.getAllResumes()
        setResumes(response)
      } catch (error) {
        toast.error('Failed to load resumes')
      } finally {
        setLoading(false)
      }
    }
    fetchResumes()
  }, [])


  const handleDeleteResume = async () => {
    try {
      await resumeService.deleteResume(resumeToDelete)
      setResumes(resumes.filter(resume => resume._id !== resumeToDelete))
      toast.success('Resume deleted successfully')
    } catch (error) {
      toast.error('Failed to delete resume')
    } finally {
      setDeleteDialogOpen(false)
      setResumeToDelete(null)
    }
  }

 
  const getRandomGradient = (id) => {

    const gradients = [
      'bg-gradient-to-br from-blue-600 to-blue-400',
      'bg-gradient-to-br from-purple-600 to-purple-400',
      'bg-gradient-to-br from-emerald-600 to-emerald-400',
      'bg-gradient-to-br from-rose-600 to-rose-400',
      'bg-gradient-to-br from-amber-600 to-amber-400',
      'bg-gradient-to-br from-indigo-600 to-indigo-400',
      'bg-gradient-to-br from-pink-600 to-pink-400',
      'bg-gradient-to-br from-teal-600 to-teal-400',
    ]
    return gradients[Math.floor(Math.random() * gradients.length)]
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Toaster richColors expand={true} />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Your Resumes</h1>
            <p className="text-gray-600 mt-2">Create, manage and download your professional resumes</p>
          </div>
          <div>
            <Button asChild>
              <Link to="/templates" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />Create Resume
              </Link>
            </Button>
          </div>
        </div>

        {/* Resumes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-sm">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resumes.map(resume => (
              <Card 
                key={resume._id}
                className="group relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full flex flex-col"
                onClick={() => navigate(`/resume/${resume._id}`)}
              >
                <div className={`${getRandomGradient(resume._id)} h-48 rounded-t-lg flex items-center justify-center transition-all duration-500 group-hover:opacity-90`}>
                  <FileText className="h-16 w-16 text-white opacity-80" />
                </div>
                <CardHeader className="flex-grow p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                      {resume.name || 'Untitled Resume'}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Ellipsis className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            setResumeToDelete(resume._id)
                            setDeleteDialogOpen(true)
                          }}
                          >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    Last updated: {new Date(resume.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete Resume?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This action cannot be undone. This will permanently delete your resume and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
              onClick={handleDeleteResume}
            >
              Delete Resume
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Dashboard