import React from 'react';
import type { RecipeFix } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Spinner } from './ui/Spinner';

interface RecipeFixDisplayProps {
  plan: RecipeFix | null;
  isLoading: boolean;
}

const RecipeFixDisplay: React.FC<RecipeFixDisplayProps> = ({ plan, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <Spinner />
        <p className="mt-4 text-lg font-semibold text-gray-700">Creating a rescue plan...</p>
        <p className="text-gray-500">Don't worry, help is on the way!</p>
      </div>
    );
  }

  if (!plan) {
    return (
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Had a kitchen mishap?</h3>
            <p className="mt-2 text-gray-600">Describe your cooking problem above, and I'll create a plan to save your dish!</p>
        </div>
    );
  }

  return (
    <Card className="bg-white rounded-2xl shadow-lg border border-gray-200">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-gray-900 text-center">{plan.title}</CardTitle>
        <CardDescription className="text-center text-lg mt-2">{plan.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
            <h3 className="text-2xl font-semibold text-gray-800 text-center mb-4">
              Your Rescue Plan
            </h3>
            <ol className="space-y-3 text-gray-700 list-decimal list-inside bg-gray-50 p-6 rounded-lg">
              {plan.steps.map((step, index) => (
                <li key={index} className="pl-2 leading-relaxed">{step}</li>
              ))}
            </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeFixDisplay;
