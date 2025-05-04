
import { useRef, useEffect, useState } from 'react';
import { Film, Loader } from 'lucide-react';

interface StreamPreviewProps {
  stream: MediaStream | null;
  isStreaming: boolean;
}

const StreamPreview = ({ stream, isStreaming }: StreamPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      
      // Add event listeners to handle video loading states
      const handleVideoLoaded = () => {
        setLoading(false);
        console.log("Video stream loaded successfully");
      };
      
      const handleVideoError = (error: any) => {
        console.error("Error loading video stream:", error);
        setLoading(false);
      };
      
      videoRef.current.addEventListener('loadeddata', handleVideoLoaded);
      videoRef.current.addEventListener('error', handleVideoError);
      
      // Set a timeout to handle cases where the event might not fire
      const timeout = setTimeout(() => {
        if (loading) {
          console.log("Video loading timed out, marking as loaded anyway");
          setLoading(false);
        }
      }, 5000);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadeddata', handleVideoLoaded);
          videoRef.current.removeEventListener('error', handleVideoError);
        }
        clearTimeout(timeout);
      };
    } else {
      setLoading(isStreaming);
    }
  }, [stream, isStreaming]);

  return (
    <div className="stream-preview-container relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {stream ? (
        <>
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain rounded-lg"
          />
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/70">
              <Loader size={50} className="mb-4 text-stream-accent animate-spin" />
              <p className="text-xl font-medium text-white">Loading stream...</p>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground h-full">
          <Film size={50} className="mb-4 text-stream-accent opacity-50" />
          <p className="text-xl font-medium">Video Preview</p>
          <p className="text-sm mt-2">
            {isStreaming ? "Loading stream..." : "Start streaming to see preview"}
          </p>
          {isStreaming && (
            <div className="mt-6">
              <Loader size={30} className="animate-spin text-stream-accent mx-auto" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StreamPreview;
