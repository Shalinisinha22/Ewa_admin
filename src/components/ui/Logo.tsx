import React from 'react';
import { ShoppingBag } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <ShoppingBag className="h-8 w-8 text-primary-500" />
      <span className="ml-2 text-xl font-bold text-white">EWA</span>
      <span className="text-xs text-primary-400 ml-1">Admin</span>
    </div>
  );
};

export default Logo;