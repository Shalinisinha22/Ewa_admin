import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const Logo: React.FC = () => {
  const { store } = useStore();
  
  return (
    <div className="flex items-center">
      {store?.logo ? (
        <img 
          src={store.logo} 
          alt={`${store.name} Logo`} 
          className="h-8 w-8 object-contain rounded"
        />
      ) : (
        // <ShoppingBag className="h-8 w-8 text-primary-500" />
        null
      )}
      <span className="ml-2 text-xl font-bold text-white">
        {store?.name || null}
      </span>
      <span className="text-xs text-primary-400 ml-1">Admin</span>
    </div>
  );
};

export default Logo;