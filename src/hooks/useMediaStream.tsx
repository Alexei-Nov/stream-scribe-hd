
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
      
      // @ts-ignore: TypeScript doesn't recognize the getDisplayMedia method yet
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: options.audio,
        video: {
          ...videoConstraints,
          displaySurface: options.displaySurface || 'monitor',
          cursor: 'always',
        },
      });

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

  const stopScreenShare = useCallback(() => {
    if (mediaState.stream) {
      mediaState.stream.getTracks().forEach(track => track.stop());
      setMediaState({
        stream: null,
        status: 'idle',
        error: null,
      });
    }
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

  useEffect(() => {
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
    startScreenShare,
    stopScreenShare,
    toggleAudio,
    changeQuality
  };
}
