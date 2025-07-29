import React from 'react';

interface LenderHeaderProps {
  activeTab: 'marketplace' | 'myoffers' | 'settings' | 'help';
  companyName: string;
}

const LenderHeader = ({ activeTab, companyName }: LenderHeaderProps) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'marketplace':
        return 'Mercado de Préstamos';
      case 'myoffers':
        return 'Mis Ofertas';
      case 'settings':
        return 'Configuración';
      case 'help':
        return 'Ayuda';
      default:
        return 'Panel de Prestamista';
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">
          {getTitle()}
        </h1>
        <p className="text-sm text-gray-600">{companyName}</p>
      </div>
    </div>
  );
};

export default LenderHeader;
