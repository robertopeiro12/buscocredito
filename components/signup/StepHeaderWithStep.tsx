import React from 'react';
import { User, Phone, MapPin, Lock } from 'lucide-react';

interface StepHeaderWithStepProps {
  step: number;
}

const StepHeaderWithStep = ({ step }: StepHeaderWithStepProps) => {
  const stepInfo = {
    1: {
      icon: <User />,
      title: "Datos Personales",
      description: "Ingresa tu información personal básica"
    },
    2: {
      icon: <Phone />,
      title: "Contacto y RFC",
      description: "Información de contacto y RFC para verificación"
    },
    3: {
      icon: <MapPin />,
      title: "Dirección",
      description: "Tu dirección de residencia"
    },
    4: {
      icon: <Lock />,
      title: "Crear tu Cuenta",
      description: "Configura tu cuenta de acceso"
    }
  };

  const currentStep = stepInfo[step as keyof typeof stepInfo];

  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        {React.cloneElement(currentStep.icon, { className: "h-6 w-6 text-blue-600" })}
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-gray-900">{currentStep.title}</h2>
      <p className="mt-1 text-sm text-gray-500">{currentStep.description}</p>
    </div>
  );
};

export default StepHeaderWithStep;
