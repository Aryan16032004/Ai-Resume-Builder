import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

export function TechnicalRound({ profileData }) {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // Generate technical questions based on skills
    useEffect(() => {
        const generateQuestions = async () => {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const response = await axios.post(`${API_BASE_URL}/api/resume/generate-technical-questions`, {
                skills: profileData.skills,
                difficulty: profileData.difficulty
            });
            setQuestions(response.data.questions);
        };

        generateQuestions();
    }, [profileData]);

    const startListening = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setUserAnswer(transcript);
        };

        recognition.start();
    };

    const handleSubmit = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const response = await axios.post(`${API_BASE_URL}/api/resume/evaluate-technical-answer`, {
            question: questions[currentQuestionIndex],
            answer: userAnswer,
        });
        setFeedback(response.data);
    };

    if (questions.length === 0) {
        return <div>Loading technical questions...</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Technical Round</h2>
            
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Question {currentQuestionIndex + 1}</h3>
                <p className="text-gray-700">{currentQuestion.question}</p>
                
                {currentQuestion.type === 'conceptual' && (
                    <div className="bg-blue-50 p-4 rounded-md">
                        <p className="font-medium">Conceptual Question</p>
                    </div>
                )}
                
                {currentQuestion.type === 'practical' && (
                    <div className="bg-green-50 p-4 rounded-md">
                        <p className="font-medium">Practical Scenario</p>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label>Your Answer</Label>
                <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full h-32 p-2 border rounded-md"
                    placeholder="Type or speak your answer..."
                />
                
                <div className="flex gap-2">
                    <Button onClick={startListening} disabled={isListening}>
                        {isListening ? 'Listening...' : 'Speak Answer'}
                    </Button>
                    <Button onClick={handleSubmit}>Submit Answer</Button>
                </div>
            </div>

            {feedback && (
                <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Feedback:</h4>
                    <p>Accuracy: {feedback.accuracy}</p>
                    <p>Depth: {feedback.depth}</p>
                    <p>Communication: {feedback.communication}</p>
                    <p>Suggestions: {feedback.suggestions}</p>
                </div>
            )}

            <div className="flex justify-between">
                <Button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => {
                        setCurrentQuestionIndex(currentQuestionIndex - 1);
                        setFeedback(null);
                        setUserAnswer('');
                    }}
                >
                    Previous
                </Button>
                
                {currentQuestionIndex < questions.length - 1 ? (
                    <Button
                        onClick={() => {
                            setCurrentQuestionIndex(currentQuestionIndex + 1);
                            setFeedback(null);
                            setUserAnswer('');
                        }}
                    >
                        Next Question
                    </Button>
                ) : (
                    <Button>Complete Round</Button>
                )}
            </div>
        </div>
    );
}
