import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../ui/button';
import {
  Briefcase,
  IndianRupee,
  Star,
  User,
  Code,
  BookOpen,
  FileText,
  Calendar,
  ChevronLeft
} from 'lucide-react';

export default function ProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const response = await axios.get(`${API_BASE_URL}/api/interview/${id}`,{
            withCredentials: true
        });
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to profiles
        </button>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-5 border-b border-gray-200 bg-indigo-50">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg">
                <User className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-6 py-5 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Briefcase className="h-5 w-5 text-indigo-500 mr-2" />
                  Job Profile
                </h2>
                <p className="text-gray-700">{profile.jobProfile}</p>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <IndianRupee className="h-5 w-5 text-indigo-500 mr-2" />
                  Salary & Level
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">{profile.salary} LPA</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                    profile.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {profile.difficulty}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 flex items-center mb-2">
                <Code className="h-5 w-5 text-indigo-500 mr-2" />
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Projects */}
            {profile.projects?.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 flex items-center mb-2">
                  <BookOpen className="h-5 w-5 text-indigo-500 mr-2" />
                  Projects
                </h2>
                <div className="space-y-4">
                  {profile.projects.map((project, index) => (
                    <div key={index} className="border-l-4 border-indigo-200 pl-4 py-2">
                      <h3 className="font-medium text-gray-800">{project.name}</h3>
                      {project.description && (
                        <p className="text-gray-600 mt-1">{project.description}</p>
                      )}
                      {project.technologies?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {project.technologies.map((tech, i) => (
                            <span 
                              key={i}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            {/* Created At */}
            <div className="text-sm text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Created: {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Footer with Start Button */}
          <div className="px-6 py-4 flex justify-end">
            <Button
              onClick={() => {
                navigate(`/interview-practice/${profile._id}`);
                console.log('Starting interview for profile:', profile._id);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Start Interview Practice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}