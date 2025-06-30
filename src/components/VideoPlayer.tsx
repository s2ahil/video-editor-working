import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';

interface Edit {
  id: string;
  type: 'trim' | 'effect' | 'speed' | 'audio';
  startTime: number;
  endTime: number;
  description: string;
}

interface VideoPlayerProps {
  videoUrl: string;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  currentTime: number;
  duration: number;
  edits: Edit[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  onTimeUpdate, 
  currentTime, 
  duration,
  edits
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // Apply edits to video
  useEffect(() => {
    if (videoRef.current && edits.length > 0) {
      // Find speed edits
      const speedEdit = edits.find(edit => edit.type === 'speed');
      if (speedEdit) {
        const speedMatch = speedEdit.description.match(/(\d+(\.\d+)?)/);
        if (speedMatch) {
          const newRate = parseFloat(speedMatch[1]);
          setPlaybackRate(newRate);
          videoRef.current.playbackRate = newRate;
        }
      }

      // Find trim edits
      const trimEdit = edits.find(edit => edit.type === 'trim');
      if (trimEdit) {
        setTrimStart(trimEdit.startTime);
        setTrimEnd(trimEdit.endTime);
        
        // If current time is outside trim range, seek to start
        if (currentTime < trimEdit.startTime || currentTime > trimEdit.endTime) {
          videoRef.current.currentTime = trimEdit.startTime;
        }
      }

      // Find audio edits
      const audioEdit = edits.find(edit => edit.type === 'audio');
      if (audioEdit && audioEdit.description.toLowerCase().includes('mute')) {
        setIsMuted(true);
        videoRef.current.muted = true;
      }
    }
  }, [edits, currentTime]);

  // Handle time updates with trim constraints
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentVideoTime = videoRef.current.currentTime;
      
      // If we have a trim edit, enforce boundaries
      if (trimEnd > 0 && currentVideoTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
      
      onTimeUpdate(currentVideoTime, videoRef.current.duration);
    }
  }, [onTimeUpdate, trimStart, trimEnd, isPlaying]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // If we have trim constraints, make sure we start within bounds
        if (trimEnd > 0 && (currentTime < trimStart || currentTime >= trimEnd)) {
          videoRef.current.currentTime = trimStart;
        }
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, currentTime, trimStart, trimEnd]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const skip = useCallback((seconds: number) => {
    if (videoRef.current) {
      let newTime = currentTime + seconds;
      
      // Respect trim boundaries
      if (trimEnd > 0) {
        newTime = Math.max(trimStart, Math.min(trimEnd, newTime));
      } else {
        newTime = Math.max(0, Math.min(duration, newTime));
      }
      
      videoRef.current.currentTime = newTime;
    }
  }, [currentTime, duration, trimStart, trimEnd]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newTime = parseFloat(e.target.value);
    
    // Respect trim boundaries
    if (trimEnd > 0) {
      newTime = Math.max(trimStart, Math.min(trimEnd, newTime));
    }
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  }, [trimStart, trimEnd]);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const getEffectiveRange = useCallback(() => {
    if (trimEnd > 0) {
      return { start: trimStart, end: trimEnd };
    }
    return { start: 0, end: duration };
  }, [trimStart, trimEnd, duration]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        videoRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [handleTimeUpdate]);

  const effectiveRange = getEffectiveRange();

  return (
    <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onClick={togglePlay}
        />
        
        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
          <button
            onClick={togglePlay}
            className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </button>
        </div>

        {/* Speed indicator */}
        {playbackRate !== 1 && (
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-white text-sm font-medium">{playbackRate}x</span>
          </div>
        )}

        {/* Trim indicator */}
        {trimEnd > 0 && (
          <div className="absolute top-4 left-4 bg-red-600/80 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-white text-sm font-medium">
              Trimmed: {formatTime(trimStart)} - {formatTime(trimEnd)}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 space-y-3">
        {/* Timeline */}
        <div className="flex items-center space-x-3">
          <span className="text-gray-300 text-sm font-mono">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative">
            <input
              type="range"
              min={effectiveRange.start}
              max={effectiveRange.end || duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer timeline-slider"
            />
            {/* Trim visualization */}
            {trimEnd > 0 && (
              <div className="absolute top-0 left-0 right-0 h-2 pointer-events-none">
                <div 
                  className="absolute h-full bg-red-500/30 rounded-l-lg"
                  style={{
                    left: '0%',
                    width: `${(trimStart / duration) * 100}%`
                  }}
                />
                <div 
                  className="absolute h-full bg-red-500/30 rounded-r-lg"
                  style={{
                    left: `${(trimEnd / duration) * 100}%`,
                    right: '0%'
                  }}
                />
              </div>
            )}
          </div>
          <span className="text-gray-300 text-sm font-mono">
            {formatTime(effectiveRange.end || duration)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => skip(-10)}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <button
              onClick={() => skip(10)}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMute}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Edit Status */}
        {edits.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700">
            {edits.map((edit) => (
              <div
                key={edit.id}
                className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300"
              >
                {edit.description}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;