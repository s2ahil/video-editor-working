import React, { useState, useCallback, useMemo } from 'react';
import { Video, Sparkles, Zap } from 'lucide-react';
import VideoUpload from './components/VideoUpload';
import VideoPlayer from './components/VideoPlayer';
import PromptInput from './components/PromptInput';
import Timeline from './components/Timeline';
import EditHistory from './components/EditHistory';
import ExportPanel from './components/ExportPanel';

interface Edit {
  id: string;
  type: 'trim' | 'effect' | 'speed' | 'audio';
  startTime: number;
  endTime: number;
  description: string;
}

interface HistoryItem {
  id: string;
  prompt: string;
  timestamp: Date;
  applied: boolean;
}

interface ExportSettings {
  format: 'mp4' | 'webm' | 'mov';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '480p' | '720p' | '1080p' | '4k';
}

function App() {
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [edits, setEdits] = useState<Edit[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleVideoUpload = useCallback((file: File) => {
    setUploadedVideo(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    // Reset edits when new video is uploaded
    setEdits([]);
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  const handleTimeUpdate = useCallback((time: number, dur: number) => {
    setCurrentTime(time);
    setDuration(dur);
  }, []);

  const parsePrompt = useCallback((prompt: string): Edit | null => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Trim command - support multiple formats
    const trimMatch = lowerPrompt.match(/trim.*?(?:from\s+)?(\d+):(\d+).*?(?:to\s+)?(\d+):(\d+)/) ||
                     lowerPrompt.match(/cut.*?(?:from\s+)?(\d+):(\d+).*?(?:to\s+)?(\d+):(\d+)/) ||
                     lowerPrompt.match(/keep.*?(?:from\s+)?(\d+):(\d+).*?(?:to\s+)?(\d+):(\d+)/);
    
    if (trimMatch) {
      const startTime = parseInt(trimMatch[1]) * 60 + parseInt(trimMatch[2]);
      const endTime = parseInt(trimMatch[3]) * 60 + parseInt(trimMatch[4]);
      
      if (startTime < endTime && endTime <= duration) {
        return {
          id: Date.now().toString(),
          type: 'trim',
          startTime,
          endTime,
          description: `Trim from ${trimMatch[1]}:${trimMatch[2]} to ${trimMatch[3]}:${trimMatch[4]}`
        };
      }
    }

    // Speed commands - support various formats
    const speedMatch = lowerPrompt.match(/(?:speed|rate).*?(\d+(?:\.\d+)?)/);
    if (speedMatch) {
      const speed = parseFloat(speedMatch[1]);
      return {
        id: Date.now().toString(),
        type: 'speed',
        startTime: 0,
        endTime: duration,
        description: `Change speed to ${speed}x`
      };
    }
    
    // Predefined speed commands
    if (lowerPrompt.includes('slow down') || lowerPrompt.includes('slower')) {
      return {
        id: Date.now().toString(),
        type: 'speed',
        startTime: 0,
        endTime: duration,
        description: 'Change speed to 0.5x'
      };
    }
    
    if (lowerPrompt.includes('speed up') || lowerPrompt.includes('faster') || lowerPrompt.includes('double speed')) {
      return {
        id: Date.now().toString(),
        type: 'speed',
        startTime: 0,
        endTime: duration,
        description: 'Change speed to 2x'
      };
    }

    // Audio commands
    if (lowerPrompt.includes('mute') || lowerPrompt.includes('remove audio') || lowerPrompt.includes('no sound')) {
      return {
        id: Date.now().toString(),
        type: 'audio',
        startTime: 0,
        endTime: duration,
        description: 'Mute audio'
      };
    }

    // Effect commands (visual feedback only for now)
    if (lowerPrompt.includes('fade') || lowerPrompt.includes('blur') || lowerPrompt.includes('effect')) {
      return {
        id: Date.now().toString(),
        type: 'effect',
        startTime: currentTime,
        endTime: Math.min(currentTime + 5, duration),
        description: `Apply ${lowerPrompt.includes('fade') ? 'fade' : lowerPrompt.includes('blur') ? 'blur' : 'effect'} effect`
      };
    }

    return null;
  }, [currentTime, duration]);

  const handlePromptSubmit = useCallback(async (prompt: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newEdit = parsePrompt(prompt);
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      prompt,
      timestamp: new Date(),
      applied: !!newEdit
    };

    // Clear future history if we're not at the end
    const newHistory = [...history.slice(0, historyIndex + 1), historyItem];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    if (newEdit) {
      // For trim edits, replace any existing trim edit
      if (newEdit.type === 'trim') {
        setEdits(prev => [...prev.filter(edit => edit.type !== 'trim'), newEdit]);
      }
      // For speed edits, replace any existing speed edit
      else if (newEdit.type === 'speed') {
        setEdits(prev => [...prev.filter(edit => edit.type !== 'speed'), newEdit]);
      }
      // For audio edits, replace any existing audio edit
      else if (newEdit.type === 'audio') {
        setEdits(prev => [...prev.filter(edit => edit.type !== 'audio'), newEdit]);
      }
      // For effects, add to existing effects
      else {
        setEdits(prev => [...prev, newEdit]);
      }
    }

    setIsProcessing(false);
  }, [parsePrompt, history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex >= 0) {
      const item = history[historyIndex];
      if (item.applied) {
        // Remove the corresponding edit
        const editToRemove = parsePrompt(item.prompt);
        if (editToRemove) {
          setEdits(prev => {
            const filtered = prev.filter(edit => edit.id !== editToRemove.id);
            // If it's a type-specific edit, remove the last one of that type
            if (editToRemove.type === 'trim' || editToRemove.type === 'speed' || editToRemove.type === 'audio') {
              return prev.filter(edit => edit.type !== editToRemove.type);
            }
            return filtered;
          });
        }
      }
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex, parsePrompt]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const item = history[nextIndex];
      if (item.applied) {
        const newEdit = parsePrompt(item.prompt);
        if (newEdit) {
          // Apply the same logic as in handlePromptSubmit
          if (newEdit.type === 'trim') {
            setEdits(prev => [...prev.filter(edit => edit.type !== 'trim'), newEdit]);
          } else if (newEdit.type === 'speed') {
            setEdits(prev => [...prev.filter(edit => edit.type !== 'speed'), newEdit]);
          } else if (newEdit.type === 'audio') {
            setEdits(prev => [...prev.filter(edit => edit.type !== 'audio'), newEdit]);
          } else {
            setEdits(prev => [...prev, newEdit]);
          }
        }
      }
      setHistoryIndex(nextIndex);
    }
  }, [history, historyIndex, parsePrompt]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
    setEdits([]);
  }, []);

  const handleExport = useCallback(async (settings: ExportSettings) => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // In a real implementation, this would process the video with the applied edits
    console.log('Exporting with settings:', settings);
    console.log('Applied edits:', edits);
    
    // Create a download link (simulation)
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `edited-video.${settings.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsExporting(false);
  }, [edits, videoUrl]);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">PromptCut</h1>
            </div>
            <div className="flex items-center space-x-1 text-gray-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">AI-Powered Video Editor</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {!uploadedVideo ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Edit Videos with AI
              </h2>
              <p className="text-gray-400 text-lg">
                Upload a video and describe your edits in natural language
              </p>
            </div>
            <VideoUpload onVideoUpload={handleVideoUpload} uploadedVideo={uploadedVideo} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
              <VideoPlayer
                videoUrl={videoUrl}
                onTimeUpdate={handleTimeUpdate}
                currentTime={currentTime}
                duration={duration}
                edits={edits}
              />

              {/* Prompt Input */}
              <PromptInput
                onPromptSubmit={handlePromptSubmit}
                isProcessing={isProcessing}
              />

              {/* Timeline */}
              <Timeline
                duration={duration}
                currentTime={currentTime}
                edits={edits}
                onSeek={handleSeek}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Edit History */}
              <EditHistory
                history={history}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onClear={handleClearHistory}
                canUndo={canUndo}
                canRedo={canRedo}
              />

              {/* Export Panel */}
              <ExportPanel
                onExport={handleExport}
                isExporting={isExporting}
              />

              {/* Video Info */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Video Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white font-mono">
                      {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Size:</span>
                    <span className="text-white">
                      {(uploadedVideo.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Edits:</span>
                    <span className="text-white">{edits.length}</span>
                  </div>
                  {edits.some(edit => edit.type === 'trim') && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-yellow-400">Trimmed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;