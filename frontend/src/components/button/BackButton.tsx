import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BackButton = ({ 
  to = null, 
  label = "Back", 
  className = "",
  showIcon = true,
  variant = "default" 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  const variants = {
    default: "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 shadow-sm hover:shadow-md",
    minimal: "bg-transparent hover:bg-gray-100 text-gray-600 border-none",
    primary: "bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md hover:shadow-lg",
  };

  const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105";
  const variantClasses = variants[variant] || variants.default;

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
      type="button"
    >
      {showIcon && <ArrowLeft className="w-5 h-5" />}
      {label}
    </button>
  );
};

export default BackButton;