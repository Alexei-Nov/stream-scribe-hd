
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";

interface MediaStreamOptions {
  audio: boolean;
  video: boolean;
  displaySurface?: 'monitor' | 'window' | 'browser';
  videoQuality?: 'standard' | 'high' | 'ultra';
}

interface MediaStreamState {
  stream: MediaStream | null;
  status: 'idle' | 'requesting' | 'active' | 'error';
  error: Error | null;
}

export default function useMediaStream() {
  const [mediaState, setMediaState] = useState<MediaStreamState>({
    stream: null,
    status: 'idle',
    error: null,
  });
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [selectedQuality, setSelectedQuality] = useState<'standard' | 'high' | 'ultra'>('high');
  const [streamId, setStreamId] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(true);
  const [joinedStreamId, setJoinedStreamId] = useState<string>('');

  const getVideoConstraints = useCallback((quality: 'standard' | 'high' | 'ultra') => {
    // Define video constraints based on quality setting
    switch (quality) {
      case 'standard':
        return {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        };
      case 'high':
        return {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 }
        };
      case 'ultra':
        return {
          width: { ideal: 3840 },
          height: { ideal: 2160 },
          frameRate: { ideal: 60 }
        };
      default:
        return {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 }
        };
    }
  }, []);

  const startScreenShare = useCallback(async (options: MediaStreamOptions) => {
    try {
      setMediaState({ ...mediaState, status: 'requesting', error: null });

      const videoConstraints = getVideoConstraints(options.videoQuality || selectedQuality);
      
      const displayMediaOptions = {
        audio: options.audio,
        video: {
          ...videoConstraints,
          displaySurface: options.displaySurface || 'monitor',
        }
      };

      // @ts-ignore: TypeScript doesn't recognize the getDisplayMedia method yet
      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

      // Handle stream ending (user stops sharing)
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
        toast.info("Screen sharing has ended");
      });

      setMediaState({
        stream,
        status: 'active',
        error: null,
      });

      // Generate unique stream ID
      const newStreamId = crypto.randomUUID();
      setStreamId(newStreamId);
      setIsHost(true);
      
      toast.success("Screen sharing started");
      return stream;
    } catch (error) {
      const err = error as Error;
      setMediaState({
        stream: null,
        status: 'error',
        error: err,
      });
      toast.error("Failed to start screen sharing");
      console.error("Screen sharing error:", err);
      return null;
    }
  }, [mediaState, selectedQuality, getVideoConstraints]);

  const joinStreamByLink = useCallback(async (joinStreamId: string) => {
    try {
      setMediaState({
        stream: null,
        status: 'requesting', 
        error: null
      });
      
      // In a real implementation with WebRTC, we would connect to the host's stream here
      // For this demo, we'll create a simulated stream to show that joining works
      // without requiring complex WebRTC setup
      
      const simulateConnection = async () => {
        // Create a canvas element to generate a stream
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        
        // Get the canvas context and draw some content
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill with a dark background
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add some text
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 48px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Connected to Stream', canvas.width / 2, canvas.height / 2 - 50);
          
          ctx.font = '24px sans-serif';
          ctx.fillText(`Stream ID: ${joinStreamId}`, canvas.width / 2, canvas.height / 2 + 20);
          
          // Add a message about the demo
          ctx.font = '18px sans-serif';
          ctx.fillStyle = '#aaaaaa';
          ctx.fillText('This is a simulated stream for demo purposes', canvas.width / 2, canvas.height / 2 + 80);
        }
        
        // Get a MediaStream from the canvas
        // @ts-ignore - some browsers might not support this method
        const simulatedStream = canvas.captureStream(30); // 30 fps
        
        // Add an audio track with silence if the browser supports it
        try {
          const audioContext = new AudioContext();
          const oscillator = audioContext.createOscillator();
          const destination = audioContext.createMediaStreamDestination();
          oscillator.connect(destination);
          oscillator.start();
          
          // Add the audio track to our stream
          const audioTrack = destination.stream.getAudioTracks()[0];
          audioTrack.enabled = false; // Start muted
          simulatedStream.addTrack(audioTrack);
        } catch (e) {
          console.log("Could not add simulated audio track:", e);
        }
        
        return simulatedStream;
      };
      
      // Wait a short time to simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create our simulated stream
      const simulatedStream = await simulateConnection();
      
      setJoinedStreamId(joinStreamId);
      setStreamId(joinStreamId);
      setIsHost(false);
      
      toast.success("Connected to stream");
      
      setMediaState({
        stream: simulatedStream,
        status: 'active',
        error: null,
      });
      
      return true;
    } catch (error) {
      const err = error as Error;
      setMediaState({
        stream: null,
        status: 'error',
        error: err,
      });
      toast.error("Failed to join stream");
      console.error("Stream join error:", err);
      return false;
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    if (mediaState.stream) {
      mediaState.stream.getTracks().forEach(track => track.stop());
      setMediaState({
        stream: null,
        status: 'idle',
        error: null,
      });
    }
    // Clear stream ID when stopping
    setStreamId('');
    setJoinedStreamId('');
  }, [mediaState]);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => !prev);
    if (mediaState.stream) {
      mediaState.stream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
    }
    toast.info(`Audio ${!isAudioEnabled ? "enabled" : "disabled"}`);
  }, [mediaState.stream, isAudioEnabled]);

  const changeQuality = useCallback((quality: 'standard' | 'high' | 'ultra') => {
    setSelectedQuality(quality);
    if (mediaState.status === 'active') {
      toast.info(`To apply ${quality} quality, please restart your stream`);
    }
  }, [mediaState.status]);

  const getShareableLink = useCallback(() => {
    if (!streamId) return '';
    
    // Create a shareable link with the stream ID as a query parameter
    const url = new URL(window.location.href);
    url.searchParams.set('join', streamId);
    
    return url.toString();
  }, [streamId]);

  useEffect(() => {
    // Check if there's a stream ID in the URL to join
    const searchParams = new URLSearchParams(window.location.search);
    const joinId = searchParams.get('join');
    
    if (joinId) {
      joinStreamByLink(joinId);
    }
    
    return () => {
      if (mediaState.stream) {
        mediaState.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    stream: mediaState.stream,
    status: mediaState.status,
    error: mediaState.error,
    isAudioEnabled,
    selectedQuality,
    streamId,
    isHost,
    joinedStreamId,
    startScreenShare,
    stopScreenShare,
    toggleAudio,
    changeQuality,
    getShareableLink,
    joinStreamByLink
  };
}
