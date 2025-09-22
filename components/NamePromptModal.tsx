import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface NamePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  defaultName?: string | null;
}

const NamePromptModal: React.FC<NamePromptModalProps> = ({ isOpen, onClose, onSubmit, defaultName }) => {
  const [name, setName] = useState(defaultName || '');

  useEffect(() => {
    setName(defaultName || '');
  }, [defaultName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome!</h2>
        <p className="text-gray-600 mb-6">Let's get your name for a more personalized experience.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name-prompt" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <Input id="name-prompt" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required />
          </div>
          <Button type="submit" className="w-full">Save and Continue</Button>
        </form>
      </div>
    </div>
  );
};

export default NamePromptModal;