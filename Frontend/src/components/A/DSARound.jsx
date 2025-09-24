import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';

const languageExtensions = {
  javascript: javascript(),
  python: python(),
  java: java(),
  cpp: cpp()
};

const languageTemplates = {
  javascript: 'function solution(input) {\n  // Your code here\n  return result;\n}',
  python: 'def solution(input):\n    # Your code here\n    return result',
  java: 'public class Solution {\n    public static Object solution(Object input) {\n        // Your code here\n        return result;\n    }\n}',
  cpp: '#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nObject solution(Object input) {\n    // Your code here\n    return result;\n}'
};



export function DSARound({ profileData }) {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [language, setLanguage] = useState('javascript');

    useEffect(() => {
        const generateQuestions = async () => {
            try {
                const difficulty = profileData.difficulty;
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
                const response = await axios.post(`${API_BASE_URL}/api/resume/generate-dsa-questions`, { difficulty });
                const data = response.data;
                setQuestions(data.questions);
                setCurrentQuestionIndex(0);
                setCode(languageTemplates[language]);
                setFeedback(null);
                if (data.questions && data.questions.length > 0) {
                    startTimer(data.questions[0].timeLimit);
                }
            } catch (err) {
                console.error('Error generating questions:', err);
                setQuestions([]);
            }
        };

        generateQuestions();
    }, [profileData]);

    useEffect(() => {
        // Reset code to template when language changes
        setCode(languageTemplates[language]);
    }, [language]);

    const startTimer = (duration) => {
        setTimeLeft(duration * 60);
        setIsRunning(true);
    };

    useEffect(() => {
        let timer;
        if (isRunning && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            handleSubmit();
        }
        return () => clearTimeout(timer);
    }, [timeLeft, isRunning]);

    const handleSubmit = async () => {
        setIsRunning(false);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const response = await axios.post(`${API_BASE_URL}/api/resume/evaluate-dsa`, {
                question: questions[currentQuestionIndex],
                code,
                language,
            });
            const result = response.data;
            
            // Stringify any object fields in the feedback
            const processedFeedback = {
                ...result,
                correctness: typeof result.correctness === 'object' ? 
                    JSON.stringify(result.correctness, null, 2) : result.correctness,
                complexity: typeof result.complexity === 'object' ? 
                    JSON.stringify(result.complexity, null, 2) : result.complexity,
                alternatives: typeof result.alternatives === 'object' ? 
                    JSON.stringify(result.alternatives, null, 2) : result.alternatives
            };
            
            setFeedback(processedFeedback);
            
            if (result.output !== undefined) {
                setOutput(typeof result.output === 'object' ? 
                    JSON.stringify(result.output, null, 2) : result.output);
            }
        } catch (err) {
            console.error('Error evaluating code:', err);
            setFeedback({ 
                score: 0, 
                correctness: "Error evaluating code.", 
                complexity: "", 
                alternatives: "" 
            });
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setFeedback(null);
            setOutput('');
            setCode(languageTemplates[language]);
            startTimer(questions[currentQuestionIndex + 1].timeLimit);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setFeedback(null);
            setOutput('');
            setCode(languageTemplates[language]);
            startTimer(questions[currentQuestionIndex - 1].timeLimit);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const renderQuestionExamples = (examples) => {
        if (!examples || !Array.isArray(examples)) return null;
        
        return examples.map((example, idx) => (
            <div key={idx} className="mb-2">
                <p><strong>Input:</strong> {JSON.stringify(example.input)}</p>
                <p><strong>Output:</strong> {JSON.stringify(example.output)}</p>
                {example.explanation && <p><strong>Explanation:</strong> {example.explanation}</p>}
            </div>
        ));
    };

    if (!questions || questions.length === 0) {
        return <div>Loading questions...</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">DSA Round</h2>
                <div className="flex items-center gap-2">
                    <span className="font-medium">Time Left:</span>
                    <span className="text-lg font-bold">{formatTime(timeLeft)}</span>
                </div>
            </div>

            <Progress value={(timeLeft / (currentQuestion.timeLimit * 60)) * 100} />

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                    Question {currentQuestionIndex + 1} of {questions.length}: {currentQuestion.title}
                </h3>
                <p className="text-gray-700">{currentQuestion.description}</p>

                {currentQuestion.examples && (
                    <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium mb-2">Examples:</h4>
                        {renderQuestionExamples(currentQuestion.examples)}
                    </div>
                )}

                {currentQuestion.constraints && Array.isArray(currentQuestion.constraints) && (
                    <div className="bg-orange-50 p-4 rounded-md">
                        <h4 className="font-medium mb-2">Constraints:</h4>
                        <ul className="list-disc pl-5">
                            {currentQuestion.constraints.map((constraint, idx) => (
                                <li key={idx}>{constraint}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label>Your Solution</Label>
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <CodeMirror
                    value={code}
                    height="300px"
                    theme="light"
                    extensions={[languageExtensions[language]]}
                    onChange={value => setCode(value)}
                    basicSetup={{
                        lineNumbers: true,
                        highlightActiveLine: true,
                        highlightActiveLineGutter: true,
                        indentOnInput: true,
                        tabSize: 2,
                    }}
                />
            </div>

            {output && (
                <div className="bg-gray-100 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Output:</h4>
                    <pre className="whitespace-pre-wrap">{output}</pre>
                </div>
            )}

            {feedback && (
                <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Feedback:</h4>
                    <p><strong>Score:</strong> {feedback.score}/25</p>
                    <p><strong>Correctness:</strong> {feedback.correctness}</p>
                    <p><strong>Complexity Analysis:</strong> {feedback.complexity}</p>
                    <p><strong>Alternative Approaches:</strong> {feedback.alternatives}</p>
                </div>
            )}

            <div className="flex justify-between">
                <Button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                >
                    Previous
                </Button>

                <Button
                    onClick={handleSubmit}
                    disabled={!code || !isRunning}
                    variant="secondary"
                >
                    Submit
                </Button>

                {currentQuestionIndex < questions.length - 1 ? (
                    <Button
                        onClick={handleNext}
                    >
                        Next Question
                    </Button>
                ) : (
                    <Button disabled={isRunning}>Complete Round</Button>
                )}
            </div>
        </div>
    );
}