
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
      
      // Removed the cursor property from the constraints as it's not recognized by TypeScript
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
      
      // In a real implementation, this would use WebRTC to connect to the host's stream
      // For now, we'll simulate joining with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This would be where we'd receive the stream from the host in a real implementation
      setStreamId(joinStreamId);
      setIsHost(false);
      
      toast.success("Connected to stream");
      
      // For demo purposes, set the stream to null since we're not actually connecting
      // In a real implementation, this would be the stream received from the host
      setMediaState({
        stream: null, // Would be the actual stream from host in real implementation
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
    startScreenShare,
    stopScreenShare,
    toggleAudio,
    changeQuality,
    getShareableLink,
    joinStreamByLink
  };
}
