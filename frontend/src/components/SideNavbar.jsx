import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, User, Settings, ChevronLeft, ChevronRight, Menu } from "lucide-react";

const SideNavbar = ({ setActiveComponent, onHoverChange }) => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (onHoverChange) {
      onHoverChange(isHovered);
    }
  }, [isHovered, onHoverChange]);

  const navItems = [
    { 
      label: "Dashboard", 
      icon: <Home className="w-5 h-5" />, 
      onClick: () => setActiveComponent('dashboard')
    },
    { 
      label: "Inventory Details", 
      icon: <ShoppingCart className="w-5 h-5" />, 
      onClick: () => setActiveComponent('inventory')
    }
  ];

  const bottomNavItems = [
    { 
      label: "Profile Settings", 
      icon: <User className="w-5 h-5" />, 
      path: "/profile" 
    },
    { 
      label: "Log Out", 
      icon: <Settings className="w-5 h-5" />, 
      path: "/login" 
    }
  ];

  return (
    <div 
      className={`fixed left-0 z-40 transition-all duration-300 ease-in-out ${
        isHovered ? 'w-64' : 'w-16'
      } bg-gradient-to-b from-gray-900 to-black text-white flex flex-col shadow-2xl h-screen`}
      style={{ top: '64px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between p-4 mb-8">
        <div className={`text-2xl font-bold transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          Inventory
        </div>
        <button 
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          onClick={() => setIsHovered(!isHovered)}
        >
          {isHovered ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      
      <nav className="flex flex-col gap-3 px-4">
        {navItems.map(({ label, icon, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-800 hover:scale-105 ${
              isHovered ? 'w-full' : 'w-12 justify-center'
            }`}
          >
            {icon}
            <span className={`transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              {label}
            </span>
          </button>
        ))}
      </nav>

      <nav className="mt-auto flex flex-col gap-3 p-4">
        {bottomNavItems.map(({ label, icon, path }) => (
          <Link
            key={label}
            to={path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-800 hover:scale-105 ${
              isHovered ? 'w-full' : 'w-12 justify-center'
            } ${
              location.pathname === path ? "bg-gray-800 font-semibold" : ""
            }`}
          >
            {icon}
            <span className={`transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default SideNavbar; 