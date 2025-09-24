import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import {
  ChevronRight,
  Clock,
  Check,
  X,
  Code as CodeIcon,
  ChevronLeft
} from 'lucide-react';

export const DSARound = ({ difficulty, onComplete, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' }
  ];

  const getLanguageExtension = () => {
    switch (language) {
      case 'python': return python();
      case 'java': return java();
      case 'cpp': return cpp();
      default: return javascript();
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const response = await axios.post(`${API_BASE_URL}/api/interview/generate-dsa-questions`, {
          difficulty
        });
        setQuestions(response.data.questions);
        setTimeLeft(response.data.questions[0]?.timeLimit * 60 || 15 * 60);
      } catch (error) {
        console.error('Error fetching DSA questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [difficulty]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

// In your DSARound component
const handleSubmit = async () => {
  try {
    setLoading(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const response = await axios.post(`${API_BASE_URL}/api/interview/evaluate-dsa`, {
      question: questions[currentQuestionIndex],
      code,
      language
    });
    
    // Handle cases where evaluation might fail
    if (response.data.error) {
      setResults({
        score: 0,
        correctness: "Evaluation failed",
        complexity: "Could not analyze",
        quality: "Could not analyze",
        alternatives: "Try again later",
        error: response.data.error
      });
    } else {
      setResults(response.data);
    }
  } catch (error) {
    console.error('Error evaluating code:', error);
    setResults({
      score: 0,
      correctness: "Evaluation failed",
      complexity: "Could not analyze",
      quality: "Could not analyze",
      alternatives: "Try again later",
      error: error.message
    });
  } finally {
    setLoading(false);
  }
};

  const handleNextQuestion = () => {
    setResults(null);
    setCode('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(questions[currentQuestionIndex + 1]?.timeLimit * 60 || 15 * 60);
    } else {
      onComplete();
    }
  };

    const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setResults(null);
      setCode('');
      setTimeLeft(questions[currentQuestionIndex - 1]?.timeLimit * 60 || 15 * 60);
    } else {
      onBack(); 
    }
  };

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
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          onClick={handlePreviousQuestion}
          disabled={loading}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-2">{currentQuestion.title}</h4>
        <p className="text-gray-700 mb-4">{currentQuestion.description}</p>
        
        {currentQuestion.examples?.length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-900 mb-1">Examples:</h5>
            {currentQuestion.examples.map((example, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md mb-2">
                <p className="text-sm font-medium">Input: <span className="font-normal">{example.input}</span></p>
                <p className="text-sm font-medium">Output: <span className="font-normal">{example.output}</span></p>
                {example.explanation && (
                  <p className="text-sm font-medium">Explanation: <span className="font-normal">{example.explanation}</span></p>
                )}
              </div>
            ))}
          </div>
        )}

        {currentQuestion.constraints?.length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-900 mb-1">Constraints:</h5>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {currentQuestion.constraints.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
        
        <CodeMirror
          value={code}
          height="300px"
          extensions={[getLanguageExtension()]}
          onChange={(value) => setCode(value)}
          className="border border-gray-300 rounded-md overflow-hidden"
        />
      </div>

      {results ? (
        <div className="mb-6 bg-gray-50 p-4 rounded-md">
          <h4 className="text-md font-medium text-gray-900 mb-2">Results</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Score: <span className="font-normal">{results.score}/25</span></p>
            </div>
            <div>
              <p className="text-sm font-medium">Correctness:</p>
              <p className="text-sm text-gray-700">{results.correctness}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Complexity:</p>
              <p className="text-sm text-gray-700">{results.complexity}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Code Quality:</p>
              <p className="text-sm text-gray-700">{results.quality}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Alternative Approaches:</p>
              <p className="text-sm text-gray-700">{results.alternatives}</p>
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={!code || loading}
          className="w-full mb-4"
        >
          {loading ? 'Evaluating...' : 'Submit Code'}
        </Button>
      )}

      <Button
        onClick={handleNextQuestion}
        className="w-full"
        variant="outline"
      >
        {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete DSA Round'}
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};