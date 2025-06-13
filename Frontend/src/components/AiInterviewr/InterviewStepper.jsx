// src/components/InterviewStepper.jsx
import { useState } from "react";
import { Card } from "../ui/card";
import { DSARound } from "./DSARound";
import { TechnicalRound } from "./TechnicalRound";
import { ProjectRound } from "./ProjectRound";
const steps = [
    { label: "DSA Round" },
    { label: "Technical Round" },
    { label: "Project Round" },
];

export function InterviewStepper({ profileData }) {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <div>
            {/* Stepper UI */}
            <div className="flex items-center justify-between mb-6">
                {steps.map((step, idx) => (
                    <div key={step.label} className="flex items-center">
                        <button
                            className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${
                                activeStep === idx
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-600 border-gray-300"
                            }`}
                            onClick={() => setActiveStep(idx)}
                            aria-label={step.label}
                        >
                            {idx + 1}
                        </button>
                        {idx < steps.length - 1 && (
                            <div className="w-8 h-1 bg-gray-300 mx-2" />
                        )}
                    </div>
                ))}
            </div>
            <InterviewContainer profileData={profileData} activeStep={activeStep} />
        </div>
    );
}

function InterviewContainer({ profileData, activeStep }) {
    return (
        <Card className="p-6 mt-4">
            {activeStep === 0 && <DSARound profileData={profileData} />}
            {activeStep === 1 && <TechnicalRound profileData={profileData} />}
            {activeStep === 2 && <ProjectRound profileData={profileData} />}
        </Card>
    );
}