import React from 'react';
import { Undo2, Redo2, Trash2, Clock } from 'lucide-react';

interface HistoryItem {
  id: string;
  prompt: string;
  timestamp: Date;
  applied: boolean;
}

interface EditHistoryProps {
  history: HistoryItem[];
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const EditHistory: React.FC<EditHistoryProps> = ({
  history,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Edit History</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClear}
            disabled={history.length === 0}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No edits yet. Start by entering a prompt above.
          </p>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border ${
                item.applied
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-gray-800 border-gray-700 opacity-50'
              }`}
            >
              <p className="text-gray-300 text-sm mb-1">{item.prompt}</p>
              <p className="text-gray-500 text-xs">{formatTime(item.timestamp)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EditHistory;