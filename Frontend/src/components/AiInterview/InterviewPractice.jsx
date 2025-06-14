import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useSelector } from 'react-redux';
import {
  Code,
  MessageSquare,
  Folder,
  ChevronLeft,
  Clock,
  Check,
  X
} from 'lucide-react';
import { DSARound } from './DSARound';
import { TechnicalRound } from './TechnicalRound';
import { ProjectRound } from './ProjectRound';

const InterviewPractice = () => {
  const user = useSelector((state) => state.auth.userData);

  const { id } = useParams();
  const navigate = useNavigate();
  const [currentRound, setCurrentRound] = useState(0);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const rounds = [
    { name: 'DSA Round', icon: <Code className="h-5 w-5" /> },
    { name: 'Technical Round', icon: <MessageSquare className="h-5 w-5" /> },
    { name: 'Project Round', icon: <Folder className="h-5 w-5" /> }
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/interview/${id}`,{
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
          <Button 
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to profile
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Interview Practice</h1>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">{user.name} Interview</h2>
            <p className="text-sm text-gray-500">{profile.jobProfile} ({profile.difficulty} level)</p>
          </div>

          <div className="px-6 py-4">
            <div className="flex justify-between mb-4">
              {rounds.map((round, index) => (
                <div 
                  key={index}
                  className={`flex flex-col items-center ${currentRound === index ? 'text-indigo-600' : 'text-gray-500'}`}
                >
                  <div className={`p-2 rounded-full ${currentRound === index ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    {round.icon}
                  </div>
                  <span className="mt-2 text-sm font-medium">{round.name}</span>
                </div>
              ))}
            </div>
            <Progress value={(currentRound + 1) * 33.33} className="h-2" />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {currentRound === 0 && (
            <DSARound
              difficulty={profile.difficulty}
              onComplete={() => setCurrentRound(1)}
              onBack={() => setCurrentRound(0)}
            />
          )}
          {currentRound === 1 && (
            <TechnicalRound 
              skills={profile.skills}
              difficulty={profile.difficulty}
              onComplete={() => setCurrentRound(2)}
              onBack={() => setCurrentRound(0)}
            />
          )}
          {currentRound === 2 && (
            <ProjectRound
              projects={profile.projects}
              onComplete={() => navigate(`/profile/${id}`)}
              onBack={() => setCurrentRound(1)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPractice;