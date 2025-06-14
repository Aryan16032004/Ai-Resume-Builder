import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { ChevronRight, ChevronLeft, Mic, MessageSquare } from 'lucide-react';

export const TechnicalRound = ({ skills, difficulty, onComplete, onBack }) => {
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
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await axios.post('http://localhost:8000/api/interview/generate-technical-questions', {
          skills,
          difficulty
        });
        setQuestions(response.data.questions);
      } catch (error) {
        console.error('Error fetching technical questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [skills, difficulty]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/api/interview/evaluate-technical-answer', {
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

  if (!questions.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No questions available</p>
      </div>
    );
  }

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
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>

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
              <p className="text-sm font-medium">Accuracy:</p>
              <p className="text-sm text-gray-700">{results.accuracy}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Depth:</p>
              <p className="text-sm text-gray-700">{results.depth}</p>
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
        {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Technical Round'}
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};