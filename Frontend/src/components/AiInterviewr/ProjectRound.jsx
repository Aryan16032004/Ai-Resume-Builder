// src/components/ProjectRound.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';

export function ProjectRound({ profileData }) {
    const [projects] = useState(profileData.projects || []);
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // Generate questions for each project
    useEffect(() => {
        const generateQuestions = async () => {
            const questionsForAllProjects = [];
            for (const project of projects) {
                const response = await axios.post('http://localhost:8000/api/resume/generate-project-questions', { project });
                questionsForAllProjects.push({
                    project: project.name,
                    questions: response.data.questions
                });
            }
            setQuestions(questionsForAllProjects);
        };

        generateQuestions();
    }, [projects]);

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
        const response = await axios.post('http://localhost:8000/api/resume/evaluate-project-answer', {
            question: currentQuestion,
            answer: userAnswer,
        });
        setFeedback(response.data);
    };

    if (questions.length === 0 || !questions[currentProjectIndex]) {
        return <div>Loading project questions...</div>;
    }

    const currentProject = projects[currentProjectIndex];
    const currentQuestionSet = questions[currentProjectIndex].questions;
    const currentQuestion = currentQuestionSet[currentQuestionIndex];

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Project Round</h2>
            
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project: {currentProject.name}</h3>
                <p className="text-gray-700">{currentProject.description}</p>
                
                <h4 className="font-medium">Question {currentQuestionIndex + 1}: {currentQuestion.question}</h4>
                <p className="text-gray-600">{currentQuestion.context}</p>
            </div>

            <div className="space-y-2">
                <label className="font-medium">Your Answer</label>
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
                    <p>Understanding: {feedback.understanding}</p>
                    <p>Technical Depth: {feedback.technicalDepth}</p>
                    <p>Communication: {feedback.communication}</p>
                    <p>Suggestions: {feedback.suggestions}</p>
                </div>
            )}

            <div className="flex justify-between">
                <Button
                    disabled={currentQuestionIndex === 0 && currentProjectIndex === 0}
                    onClick={() => {
                        if (currentQuestionIndex > 0) {
                            setCurrentQuestionIndex(currentQuestionIndex - 1);
                        } else {
                            setCurrentProjectIndex(currentProjectIndex - 1);
                            setCurrentQuestionIndex(questions[currentProjectIndex - 1].questions.length - 1);
                        }
                        setFeedback(null);
                        setUserAnswer('');
                    }}
                >
                    Previous
                </Button>
                
                {currentQuestionIndex < currentQuestionSet.length - 1 || 
                currentProjectIndex < projects.length - 1 ? (
                    <Button
                        onClick={() => {
                            if (currentQuestionIndex < currentQuestionSet.length - 1) {
                                setCurrentQuestionIndex(currentQuestionIndex + 1);
                            } else {
                                setCurrentProjectIndex(currentProjectIndex + 1);
                                setCurrentQuestionIndex(0);
                            }
                            setFeedback(null);
                            setUserAnswer('');
                        }}
                    >
                        Next Question
                    </Button>
                ) : (
                    <Button>Complete Interview</Button>
                )}
            </div>
        </div>
    );
}
