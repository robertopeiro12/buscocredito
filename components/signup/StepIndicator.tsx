import React from 'react';
import { Check } from 'lucide-react';
import { StepIndicatorProps } from '@/types/signup';

const steps = [
  { number: 1, title: 'Personal' },
  { number: 2, title: 'Contacto' },
  { number: 3, title: 'Dirección' },
  { number: 4, title: 'Cuenta' },
];

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  return (
    <nav aria-label="Progreso del registro">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <li key={step.number} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#0e3a45] border-[#0e3a45]'
                      : isActive
                      ? 'bg-white border-[#0e3a45]'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  ) : (
                    <span className={`text-sm font-semibold ${isActive ? 'text-[#0e3a45]' : 'text-gray-400'}`}>
                      {step.number}
                    </span>
                  )}
                </div>
                <span className={`mt-1.5 text-xs font-medium ${isCompleted || isActive ? 'text-[#0e3a45]' : 'text-gray-400'}`}>
                  {step.title}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-300 ${isCompleted ? 'bg-[#0e3a45]' : 'bg-gray-200'}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepIndicator;
