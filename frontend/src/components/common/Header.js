import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ 
  title, 
  subtitle, 
  showBackButton = false, 
  backPath = '/', 
  children 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(backPath);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="btn-secondary"
            >
              <ArrowLeft size={16} />
              Volver
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Header;