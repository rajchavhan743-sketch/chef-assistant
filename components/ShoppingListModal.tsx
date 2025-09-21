import React, { useState } from 'react';
import { generateShoppingLinks } from '../services/geminiService';
import { Spinner } from './ui/Spinner';
import { TrashIcon } from './icons/TrashIcon';
import { LinkIcon } from './icons/LinkIcon';

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: string[];
  onClear: () => void;
}

type ShoppingLink = {
    title: string;
    uri: string;
}

const ShoppingListModal: React.FC<ShoppingListModalProps> = ({ isOpen, onClose, items, onClear }) => {
  const [links, setLinks] = useState<ShoppingLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateLinks = async () => {
    setIsLoading(true);
    setError(null);
    setLinks([]);
    try {
      const result = await generateShoppingLinks(items);
      setLinks(result);
    } catch (err) {
      setError('Could not fetch shopping links. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    onClear();
    setLinks([]);
    setError(null);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Your Shopping List</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </header>
        
        <div className="p-6 overflow-y-auto">
          {items.length > 0 ? (
            <ul className="space-y-2">
              {items.map(item => (
                <li key={item} className="bg-gray-100 p-2 rounded-md capitalize">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">Your shopping list is empty.</p>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
            {isLoading && (
                <div className="flex justify-center items-center flex-col">
                    <Spinner />
                    <p className="mt-2 text-gray-600">Finding online stores...</p>
                </div>
            )}
            {error && <p className="text-red-500 text-center mb-2">{error}</p>}
            {links.length > 0 && (
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Shopping Links:</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {links.map(link => (
                            <a 
                                href={link.uri} 
                                key={link.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center p-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-700"
                            >
                                <LinkIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{link.title}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
          <button
            onClick={handleGenerateLinks}
            disabled={items.length === 0 || isLoading}
            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            Find Online Stores
          </button>
           <button
            onClick={handleClear}
            disabled={items.length === 0}
            className="w-full mt-2 flex items-center justify-center text-red-600 font-bold py-2 px-4 rounded-lg hover:bg-red-50 disabled:text-gray-400 disabled:hover:bg-transparent"
          >
            <TrashIcon className="w-5 h-5 mr-2"/> Clear List
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingListModal;
