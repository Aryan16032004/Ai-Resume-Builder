import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { ChevronRight, ChevronLeft, Mic, MessageSquare } from 'lucide-react';

export const ProjectRound = ({ projects, onComplete,onBack}) => {
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

    // Check if SpeechRecognition is available
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSpeechSupported(!!SpeechRecognition);
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      fetchQuestions(projects[selectedProjectIndex]);
    }
  }, [selectedProjectIndex, projects]);

  const fetchQuestions = async (project) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/api/interview/generate-project-questions', {
        project
      });
      setQuestions(response.data.questions);
      setCurrentQuestionIndex(0);
      setResults(null);
      setAnswer('');
    } catch (error) {
      console.error('Error fetching project questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/api/interview/evaluate-project-answer', {
        question: questions[currentQuestionIndex],
        answer
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error evaluating answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    setResults(null);
    setAnswer('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (selectedProjectIndex < projects.length - 1) {
      setSelectedProjectIndex(selectedProjectIndex + 1);
    } else {
      onComplete();
    }
  };
const startRecording = () => {
  if (!isSpeechSupported) {
    alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognitionRef.current = new SpeechRecognition();
  recognitionRef.current.continuous = true;
  recognitionRef.current.interimResults = true;
  recognitionRef.current.lang = 'en-US';

  let finalTranscript = answer; // Start with existing answer

  recognitionRef.current.onresult = (event) => {
    let interimTranscript = '';
    
    // Process all results
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        // For final results, add to the final transcript
        finalTranscript += (finalTranscript ? ' ' : '') + transcript;
      } else {
        // For interim results, show them temporarily
        interimTranscript += transcript;
      }
    }
    
    // Update the textarea with both final and interim results
    setAnswer(finalTranscript + (interimTranscript ? ' ' + interimTranscript : ''));
  };

  recognitionRef.current.onerror = (event) => {
    console.error('Speech recognition error', event.error);
    setIsRecording(false);
  };

  recognitionRef.current.onend = () => {
    if (isRecording) {
      recognitionRef.current.start();
    }
  };

  recognitionRef.current.start();
  setIsRecording(true);
};

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

 const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setResults(null);
      setAnswer('');
    } else if (selectedProjectIndex > 0) {
      setSelectedProjectIndex(selectedProjectIndex - 1);
      setCurrentQuestionIndex(0);
      setResults(null);
      setAnswer('');
    } else {
      onBack();
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);


  if (loading && !questions.length) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No projects available</p>
      </div>
    );
  }

  const currentProject = projects[selectedProjectIndex];
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="p-6">
      <div className="mb-6">
         <div className="flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            onClick={handlePreviousQuestion}
            disabled={loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
         <h3 className="text-lg font-medium text-gray-900 mb-2">
          Project {selectedProjectIndex + 1} of {projects.length}
        </h3>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <h4 className="font-medium text-gray-900 mb-1">{currentProject.name}</h4>
          {currentProject.description && (
            <p className="text-gray-700 mb-2">{currentProject.description}</p>
          )}
          {currentProject.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {currentProject.technologies.map((tech, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {questions.length > 0 && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h3>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="text-gray-700 mb-2">{currentQuestion.question}</p>
              {currentQuestion.context && (
                <p className="text-sm text-gray-500">{currentQuestion.context}</p>
              )}
            </div>
          </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Answer:
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Type your answer here or use the microphone..."
        />
        <div className="mt-2 flex justify-end">
          <Button
            onClick={toggleRecording}
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            className="flex items-center"
            disabled={!isSpeechSupported}
          >
            {isRecording ? (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Record Answer
              </>
            )}
          </Button>
        </div>
        {!isSpeechSupported && (
          <p className="text-xs text-red-500 mt-2">
            Note: Speech recognition is only supported in Chrome and Edge browsers
          </p>
        )}
        {isRecording && (
          <p className="text-xs text-green-600 mt-2">
            Listening... Speak now and your words will appear above
          </p>
        )}
      </div>

          {results ? (
            <div className="mb-6 bg-gray-50 p-4 rounded-md">
              <h4 className="text-md font-medium text-gray-900 mb-2">Feedback</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Understanding:</p>
                  <p className="text-sm text-gray-700">{results.understanding}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Technical Depth:</p>
                  <p className="text-sm text-gray-700">{results.technicalDepth}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Communication:</p>
                  <p className="text-sm text-gray-700">{results.communication}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Suggestions:</p>
                  <p className="text-sm text-gray-700">{results.suggestions}</p>
                </div>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!answer || loading}
              className="w-full mb-4"
            >
              {loading ? 'Evaluating...' : 'Submit Answer'}
            </Button>
          )}

          <Button
            onClick={handleNextQuestion}
            className="w-full"
            variant="outline"
          >
            {currentQuestionIndex < questions.length - 1 
              ? 'Next Question' 
              : selectedProjectIndex < projects.length - 1 
                ? 'Next Project' 
                : 'Complete Project Round'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </>
      )}
    </div>
  );
};