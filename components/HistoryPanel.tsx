import React from 'react';
import type { HistoryItem } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { HistoryIcon } from './icons/HistoryIcon';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onSelect, onClear }) => {
  const timeSince = (timestamp: number) => {
    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full bg-white w-full max-w-sm z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <header className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <HistoryIcon className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-800">Search History</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </header>

          <div className="flex-grow p-4 overflow-y-auto">
            {history.length > 0 ? (
              <ul className="space-y-3">
                {history.map(item => (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelect(item)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-green-50 rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
                    >
                      <p className="font-semibold text-gray-800 truncate">{item.displayTitle}</p>
                      <p className="text-xs text-gray-500">{timeSince(item.timestamp)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>Your search history is empty.</p>
                <p className="text-sm">Start a new search to see it here!</p>
              </div>
            )}
          </div>

          <footer className="p-4 border-t border-gray-200">
            <button
              onClick={onClear}
              disabled={history.length === 0}
              className="w-full flex items-center justify-center text-sm text-red-600 font-bold py-2 px-4 rounded-lg hover:bg-red-50 disabled:text-gray-400 disabled:hover:bg-transparent transition-colors"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Clear History
            </button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default HistoryPanel;
