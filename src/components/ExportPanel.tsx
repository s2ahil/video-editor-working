import React, { useState } from 'react';
import { Download, Settings, FileVideo, Loader2 } from 'lucide-react';

interface ExportPanelProps {
  onExport: (settings: ExportSettings) => void;
  isExporting: boolean;
}

interface ExportSettings {
  format: 'mp4' | 'webm' | 'mov';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '480p' | '720p' | '1080p' | '4k';
}

const ExportPanel: React.FC<ExportPanelProps> = ({ onExport, isExporting }) => {
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'mp4',
    quality: 'high',
    resolution: '1080p'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleExport = () => {
    onExport(settings);
  };

  const formatOptions = [
    { value: 'mp4', label: 'MP4 (Recommended)', description: 'Best compatibility' },
    { value: 'webm', label: 'WebM', description: 'Smaller file size' },
    { value: 'mov', label: 'MOV', description: 'High quality' }
  ];

  const qualityOptions = [
    { value: 'low', label: 'Low', description: 'Fastest export' },
    { value: 'medium', label: 'Medium', description: 'Balanced' },
    { value: 'high', label: 'High', description: 'Best quality' },
    { value: 'ultra', label: 'Ultra', description: 'Maximum quality' }
  ];

  const resolutionOptions = [
    { value: '480p', label: '480p', description: 'Small file' },
    { value: '720p', label: '720p HD', description: 'Standard HD' },
    { value: '1080p', label: '1080p Full HD', description: 'Full HD' },
    { value: '4k', label: '4K Ultra HD', description: 'Ultra HD' }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center space-x-2">
          <FileVideo className="w-5 h-5" />
          <span>Export Video</span>
        </h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Format Selection */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Format</label>
          <div className="grid grid-cols-1 gap-2">
            {formatOptions.map((option) => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value={option.value}
                  checked={settings.format === option.value}
                  onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value as any }))}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <p className="text-white text-sm">{option.label}</p>
                  <p className="text-gray-400 text-xs">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <>
            {/* Quality */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Quality</label>
              <select
                value={settings.quality}
                onChange={(e) => setSettings(prev => ({ ...prev, quality: e.target.value as any }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {qualityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Resolution */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Resolution</label>
              <select
                value={settings.resolution}
                onChange={(e) => setSettings(prev => ({ ...prev, resolution: e.target.value as any }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {resolutionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Export Video</span>
            </>
          )}
        </button>

        {/* Export Info */}
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-gray-300 text-sm font-medium mb-1">Export Settings</p>
          <div className="text-gray-400 text-xs space-y-1">
            <p>Format: {settings.format.toUpperCase()}</p>
            <p>Quality: {settings.quality}</p>
            <p>Resolution: {settings.resolution}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;