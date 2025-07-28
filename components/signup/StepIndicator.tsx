import React from 'react';
import { StepIndicatorProps } from '@/types/signup';

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const steps = [
    { number: 1, title: "Personal" },
    { number: 2, title: "Contacto" },
    { number: 3, title: "Dirección" },
    { number: 4, title: "Cuenta" },
  ];

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between w-full max-w-2xl mx-auto">
        {steps.map((step) => (
          <li key={step.number} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                step.number <= currentStep
                  ? "border-white bg-white"
                  : "border-green-200 bg-transparent"
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  step.number <= currentStep ? "text-green-600" : "text-white"
                }`}
              >
                {step.number}
              </span>
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                step.number <= currentStep ? "text-white" : "text-green-200"
              }`}
            >
              {step.title}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StepIndicator;
