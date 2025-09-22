import React from 'react';
import type { MenuPlan } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Spinner } from './ui/Spinner';

interface MenuPlanDisplayProps {
  plan: MenuPlan | null;
  isLoading: boolean;
}

const MenuPlanDisplay: React.FC<MenuPlanDisplayProps> = ({ plan, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <Spinner />
        <p className="mt-4 text-lg font-semibold text-gray-700">Planning the perfect menu for you...</p>
        <p className="text-gray-500">This might take a moment.</p>
      </div>
    );
  }

  if (!plan) {
    return null; // Don't render anything if there's no plan
  }

  return (
    <Card className="bg-white rounded-2xl shadow-lg border border-gray-200">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-gray-900 text-center">{plan.planTitle}</CardTitle>
        <CardDescription className="text-center text-lg mt-2">{plan.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center my-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-lg font-semibold text-green-800">Total Estimated Budget: <span className="font-bold">{plan.estimatedCost}</span></p>
        </div>
        <div className="space-y-6">
          {plan.categories.map((category) => (
            <div key={category.categoryName}>
              <div className="flex justify-between items-baseline border-b-2 border-green-500 pb-2 mb-4">
                <h3 className="text-2xl font-semibold text-gray-800">
                  {category.categoryName}
                </h3>
                <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-md">
                  ~ {category.estimatedCost}
                </span>
              </div>
              <ul className="space-y-4">
                {category.items.map((item) => (
                  <li key={item.name} className="p-3 bg-gray-50 rounded-lg flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <p className="font-bold text-gray-800">{item.name}</p>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap pt-1">
                      {item.estimatedCost}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {plan.planOfAction && plan.planOfAction.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-800 text-center mb-4">
              Chef's Tips for Success
            </h3>
            <ul className="space-y-2 text-gray-700 list-disc list-inside bg-gray-50 p-4 rounded-lg">
              {plan.planOfAction.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default MenuPlanDisplay;