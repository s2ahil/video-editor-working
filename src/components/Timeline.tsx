import React, { useMemo } from 'react';
import { Scissors, Zap, Palette, Volume2 } from 'lucide-react';

interface Edit {
  id: string;
  type: 'trim' | 'effect' | 'speed' | 'audio';
  startTime: number;
  endTime: number;
  description: string;
}

interface TimelineProps {
  duration: number;
  currentTime: number;
  edits: Edit[];
  onSeek: (time: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({ duration, currentTime, edits, onSeek }) => {
  const timeMarkers = useMemo(() => {
    const markers = [];
    const interval = Math.max(1, Math.floor(duration / 10));
    for (let i = 0; i <= duration; i += interval) {
      markers.push(i);
    }
    return markers;
  }, [duration]);

  const getEditIcon = (type: Edit['type']) => {
    switch (type) {
      case 'trim': return Scissors;
      case 'effect': return Palette;
      case 'speed': return Zap;
      case 'audio': return Volume2;
      default: return Scissors;
    }
  };

  const getEditColor = (type: Edit['type']) => {
    switch (type) {
      case 'trim': return 'bg-red-500';
      case 'effect': return 'bg-purple-500';
      case 'speed': return 'bg-yellow-500';
      case 'audio': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;
    onSeek(time);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h3 className="text-white font-medium flex items-center space-x-2">
        <span>Timeline</span>
        <span className="text-gray-400 text-sm">({edits.length} edits)</span>
      </h3>

      <div className="relative">
        {/* Time markers */}
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          {timeMarkers.map((time) => (
            <span key={time} className="font-mono">
              {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
            </span>
          ))}
        </div>

        {/* Timeline track */}
        <div
          className="relative h-12 bg-gray-700 rounded-lg cursor-pointer overflow-hidden"
          onClick={handleTimelineClick}
        >
          {/* Waveform visualization */}
          <div className="absolute inset-0 flex items-center">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gray-600 mx-px"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  opacity: 0.3
                }}
              />
            ))}
          </div>

          {/* Edits */}
          {edits.map((edit) => {
            const startPercent = (edit.startTime / duration) * 100;
            const widthPercent = ((edit.endTime - edit.startTime) / duration) * 100;
            const Icon = getEditIcon(edit.type);

            return (
              <div
                key={edit.id}
                className={`absolute top-0 h-full ${getEditColor(edit.type)} bg-opacity-70 flex items-center justify-center group`}
                style={{
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                  minWidth: '2px'
                }}
                title={edit.description}
              >
                <Icon className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}

          {/* Current time indicator */}
          <div
            className="absolute top-0 w-0.5 h-full bg-white shadow-lg"
            style={{
              left: `${(currentTime / duration) * 100}%`
            }}
          >
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full shadow-lg" />
          </div>
        </div>

        {/* Edit labels */}
        {edits.length > 0 && (
          <div className="mt-3 space-y-1">
            {edits.map((edit) => {
              const Icon = getEditIcon(edit.type);
              return (
                <div key={edit.id} className="flex items-center space-x-2 text-sm">
                  <Icon className={`w-4 h-4 ${getEditColor(edit.type).replace('bg-', 'text-')}`} />
                  <span className="text-gray-300">{edit.description}</span>
                  <span className="text-gray-500 font-mono">
                    {Math.floor(edit.startTime / 60)}:{(edit.startTime % 60).toString().padStart(2, '0')} - 
                    {Math.floor(edit.endTime / 60)}:{(edit.endTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;