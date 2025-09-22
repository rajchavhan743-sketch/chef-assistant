import React from 'react';
import type { FoodAnalysis } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { FlameIcon } from './icons/FlameIcon';

interface FoodAnalysisDisplayProps {
  analysis: FoodAnalysis | null;
  isLoading: boolean;
}

const InfoIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const FoodAnalysisDisplay: React.FC<FoodAnalysisDisplayProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <Spinner />
        <p className="mt-4 text-lg font-semibold text-gray-700">Analyzing your meal...</p>
        <p className="text-gray-500">The AI is identifying the food and calculating its nutritional value.</p>
      </div>
    );
  }

  if (!analysis) {
    return (
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Curious about your meal's calories?</h3>
            <p className="mt-2 text-gray-600">Upload a photo, and I'll break it down for you!</p>
        </div>
    );
  }

  return (
    <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-gray-900 text-center">Nutritional Analysis</CardTitle>
        <CardDescription className="text-center text-lg mt-2">{analysis.summary}</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="mb-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-2 text-center">Identified Foods</h3>
            <div className="flex flex-wrap justify-center gap-2">
                {analysis.identifiedFoods.map((food, index) => (
                    <span key={index} className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1.5 rounded-full capitalize">
                        {food}
                    </span>
                ))}
            </div>
        </div>

        <div className="text-center my-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-lg font-semibold text-green-800 flex items-center justify-center">
                <FlameIcon className="w-6 h-6 mr-2" />
                Total Estimated Calories: <span className="font-bold ml-2">{analysis.calorieInfo.totalCalories}</span>
            </p>
        </div>
        
        {analysis.portionSizeAssumption && (
            <div className="my-4 p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 flex items-start">
                <InfoIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                    <span className="font-semibold">AI's Note:</span> {analysis.portionSizeAssumption}
                </p>
            </div>
        )}

        <div className="grid grid-cols-3 gap-4 text-center p-4 bg-gray-50 rounded-lg">
            <div>
                <p className="text-sm text-gray-600">Protein</p>
                <p className="text-lg font-bold text-gray-800">{analysis.calorieInfo.protein}</p>
            </div>
            <div>
                <p className="text-sm text-gray-600">Carbohydrates</p>
                <p className="text-lg font-bold text-gray-800">{analysis.calorieInfo.carbohydrates}</p>
            </div>
            <div>
                <p className="text-sm text-gray-600">Fat</p>
                <p className="text-lg font-bold text-gray-800">{analysis.calorieInfo.fat}</p>
            </div>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">* All nutritional values are estimates provided by AI and should be considered as a guide, not a medical assessment.</p>
        
      </CardContent>
    </Card>
  );
};

export default FoodAnalysisDisplay;