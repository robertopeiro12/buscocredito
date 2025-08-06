import React from 'react';
import { StepHeaderProps } from '@/types/signup';

const StepHeader = ({ icon, title, description }: StepHeaderProps) => (
  <div className="text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
      {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6 text-green-600" })}
    </div>
    <h2 className="mt-4 text-2xl font-semibold text-gray-900">{title}</h2>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
  </div>
);

export default StepHeader;
