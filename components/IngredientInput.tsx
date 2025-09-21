
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface IngredientInputProps {
  onAddIngredient: (ingredient: string) => void;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ onAddIngredient }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onAddIngredient(value.trim());
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-4">
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g., chicken breast, tomatoes"
        className="flex-grow"
      />
      <Button type="submit" className="w-full sm:w-auto">
        Add Ingredient
      </Button>
    </form>
  );
};

export default IngredientInput;
