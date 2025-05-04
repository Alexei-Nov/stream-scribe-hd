
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import useMediaStream from '@/hooks/useMediaStream';
import StreamPreview from '@/components/StreamPreview';
import SourceSelector from '@/components/SourceSelector';
import SettingsPanel from '@/components/SettingsPanel';
import StreamControls from '@/components/StreamControls';
import { Camera } from 'lucide-react';

const Index = () => {
  const [displaySurface, setDisplaySurface] = useState<'monitor' | 'window' | 'browser'>('monitor');
  const {
    stream,
    status,
    isAudioEnabled,
    selectedQuality,
    startScreenShare,
    stopScreenShare,
    toggleAudio,
    changeQuality
  } = useMediaStream();

  const isStreaming = status === 'active' || status === 'requesting';

  const handleStartStream = async () => {
    await startScreenShare({
      audio: isAudioEnabled,
      video: true,
      displaySurface: displaySurface,
      videoQuality: selectedQuality
    });
  };

  return (
    <div className="container py-6 px-4 sm:px-6 max-w-7xl mx-auto h-screen flex flex-col">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Camera className="w-6 h-6 text-stream-accent" />
          <h1 className="text-2xl font-bold">Stream Scribe HD</h1>
        </div>
        
        {isStreaming && (
          <div className="streaming-indicator">
            <span className="h-2 w-2 bg-red-500 rounded-full"></span>
            <span>Live</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 pb-6">
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="flex-1 min-h-[300px]">
            <StreamPreview stream={stream} isStreaming={isStreaming} />
          </div>
          
          <Card className="border-stream-border bg-stream-muted">
            <CardContent className="py-4">
              <StreamControls 
                isStreaming={isStreaming}
                audioEnabled={isAudioEnabled}
                onStartStream={handleStartStream}
                onStopStream={stopScreenShare}
                onAudioToggle={toggleAudio}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <SourceSelector 
            onSourceSelect={setDisplaySurface}
            disabled={isStreaming}
            activeSource={displaySurface}
          />
          
          <SettingsPanel 
            quality={selectedQuality}
            onQualityChange={changeQuality}
            audioEnabled={isAudioEnabled}
            onAudioToggle={toggleAudio}
            isStreaming={isStreaming}
          />
        </div>
      </div>

      <footer className="text-center text-sm text-muted-foreground pt-4">
        <p>Stream Scribe HD &copy; 2025 - High Definition Screen and Audio Sharing</p>
      </footer>
    </div>
  );
};

export default Index;
