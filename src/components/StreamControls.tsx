
import { Video, Mic, MicOff, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StreamControlsProps {
  isStreaming: boolean;
  audioEnabled: boolean;
  onStartStream: () => void;
  onStopStream: () => void;
  onAudioToggle: () => void;
}

const StreamControls = ({
  isStreaming,
  audioEnabled,
  onStartStream,
  onStopStream,
  onAudioToggle,
}: StreamControlsProps) => {
  return (
    <div className="flex items-center gap-4 w-full">
      {!isStreaming ? (
        <Button 
          onClick={onStartStream} 
          className="flex-1 bg-stream-accent hover:bg-stream-hover"
          size="lg"
        >
          <Video className="mr-2 h-4 w-4" />
          Start Streaming
        </Button>
      ) : (
        <Button 
          onClick={onStopStream} 
          variant="destructive"
          className="flex-1"
          size="lg"
        >
          <StopCircle className="mr-2 h-4 w-4" />
          Stop Streaming
        </Button>
      )}
      
      <Button 
        onClick={onAudioToggle}
        variant="outline"
        size="icon"
        className={cn(
          "border-stream-border",
          audioEnabled ? "bg-stream-muted hover:bg-stream-border" : "bg-destructive/20 hover:bg-destructive/30 text-destructive"
        )}
      >
        {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default StreamControls;
