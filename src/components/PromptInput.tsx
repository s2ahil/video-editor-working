import React, { useState, useCallback } from 'react';
import { Send, Sparkles, Zap, Scissors, Palette } from 'lucide-react';

interface PromptInputProps {
  onPromptSubmit: (prompt: string) => void;
  isProcessing: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onPromptSubmit, isProcessing }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onPromptSubmit(prompt.trim());
      setPrompt('');
    }
  }, [prompt, onPromptSubmit]);

  const suggestedPrompts = [
    { icon: Scissors, text: "Trim the video from 0:30 to 1:45" },
    { icon: Zap, text: "Speed up the video by 2x" },
    { icon: Palette, text: "Slow down the video" },
    { icon: Sparkles, text: "Mute the audio" }
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how you want to edit your video... 

Examples:
• 'Trim from 0:30 to 2:00'
• 'Speed up by 2x' 
• 'Slow down the video'
• 'Mute the audio'
• 'Cut from 1:15 to 3:30'"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-32"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isProcessing}
              className="absolute right-3 bottom-3 p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
          </div>
        </form>
        
        {/* AI Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg blur-xl -z-10 opacity-50" />
      </div>

      {/* Suggested Prompts */}
      <div className="space-y-2">
        <p className="text-gray-400 text-sm font-medium">Quick commands:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {suggestedPrompts.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setPrompt(suggestion.text)}
              disabled={isProcessing}
              className="flex items-center space-x-3 p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <suggestion.icon className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
              <span className="text-gray-300 text-sm">{suggestion.text}</span>
            </button>
          ))}
        </div>
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center space-x-2 text-purple-400">
          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Processing your edit...</span>
        </div>
      )}
    </div>
  );
};

export default PromptInput;