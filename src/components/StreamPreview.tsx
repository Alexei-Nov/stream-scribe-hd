
import { useRef, useEffect } from 'react';
import { Film } from 'lucide-react';

interface StreamPreviewProps {
  stream: MediaStream | null;
  isStreaming: boolean;
}

const StreamPreview = ({ stream, isStreaming }: StreamPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="stream-preview-container">
      {stream ? (
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain rounded-lg"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <Film size={50} className="mb-4 text-stream-accent opacity-50" />
          <p className="text-xl font-medium">Video Preview</p>
          <p className="text-sm mt-2">
            {isStreaming ? "Loading stream..." : "Start streaming to see preview"}
          </p>
        </div>
      )}
    </div>
  );
};

export default StreamPreview;
