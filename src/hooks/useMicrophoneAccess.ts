
import * as React from 'react';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';

export const useMicrophoneAccess = () => {
  const [permissionDenied, setPermissionDenied] = React.useState(false);
  const [microphoneAvailable, setMicrophoneAvailable] = React.useState(false);
  const [browserSupport, setBrowserSupport] = React.useState(false);
  const { toast: uiToast } = useToast();
  
  React.useEffect(() => {
    // Check if browser supports speech recognition
    const checkSpeechSupport = () => {
      const speechSupported = 
        'SpeechRecognition' in window || 
        'webkitSpeechRecognition' in window;
      
      setBrowserSupport(speechSupported);
      
      if (!speechSupported) {
        console.log('Speech recognition not supported in this browser');
      } else {
        console.log('Speech recognition is supported');
      }
    };
    
    checkSpeechSupport();
  }, []);
  
  React.useEffect(() => {
    const checkMicrophoneAccess = async () => {
      try {
        // First try to check permissions using the Permissions API
        if ('permissions' in navigator) {
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            console.log('Microphone permission status:', permissionStatus.state);
            
            const updatePermissionState = () => {
              console.log('Microphone permission changed to:', permissionStatus.state);
              setPermissionDenied(permissionStatus.state === 'denied');
              setMicrophoneAvailable(permissionStatus.state === 'granted');
            };
            
            permissionStatus.onchange = updatePermissionState;
            updatePermissionState();
            
            // If permission is prompt, we should also check getUserMedia
            if (permissionStatus.state === 'prompt') {
              await tryGetUserMedia();
            }
          } catch (err) {
            console.error('Error checking microphone permission:', err);
            await tryGetUserMedia();
          }
        } else {
          // Fallback to getUserMedia if Permissions API is not available
          await tryGetUserMedia();
        }
      } catch (error) {
        console.error('Error during microphone check:', error);
        setMicrophoneAvailable(false);
        setPermissionDenied(true);
      }
    };
    
    const tryGetUserMedia = async () => {
      try {
        console.log('Attempting to get user media...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAvailable(true);
        setPermissionDenied(false);
        console.log('Microphone access granted');
        
        // List available audio devices
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices.filter(device => device.kind === 'audioinput');
          console.log('Available audio input devices:', audioInputs);
        } catch (err) {
          console.error('Error enumerating devices:', err);
        }
        
        // Important: Stop the tracks when done to release the microphone
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error("Microphone access error:", error);
        setMicrophoneAvailable(false);
        
        if (error instanceof DOMException) {
          setPermissionDenied(true);
          
          if (error.name === 'NotAllowedError') {
            console.error('Microphone access denied by user or system');
            toast.error("Microphone access was denied. Please ensure your browser has permission to use the microphone.", {
              duration: 5000,
            });
            
            // Show browser-specific instructions
            const browser = getBrowserName();
            let settingsInstructions = "Check your browser settings to enable microphone access.";
            
            if (browser === 'Chrome') {
              settingsInstructions = "Go to Chrome Settings > Privacy and Security > Site Settings > Microphone";
            } else if (browser === 'Firefox') {
              settingsInstructions = "Go to Firefox Preferences > Privacy & Security > Permissions > Microphone";
            } else if (browser === 'Safari') {
              settingsInstructions = "Go to Safari Preferences > Websites > Microphone";
            } else if (browser === 'Edge') {
              settingsInstructions = "Go to Edge Settings > Cookies and site permissions > Microphone";
            }
            
            uiToast({
              title: "Microphone Access Denied",
              description: `${settingsInstructions} to allow this site to use your microphone.`,
              variant: "destructive",
            });
          } else if (error.name === 'NotFoundError') {
            console.error('No microphone found on this device');
            toast.error("No microphone found on this device. Please connect a microphone and try again.", {
              duration: 5000,
            });
          } else {
            toast.error(`Microphone error: ${error.name}. Please check your device settings.`, {
              duration: 5000,
            });
          }
        } else {
          toast.error("Could not access microphone. Please check your device settings.", {
            duration: 5000,
          });
        }
      }
    };
    
    checkMicrophoneAccess();
  }, [uiToast]);

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    let browserName;
    
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "Chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "Firefox";
    } else if (userAgent.match(/safari/i)) {
      browserName = "Safari";
    } else if (userAgent.match(/opr\//i)) {
      browserName = "Opera";
    } else if (userAgent.match(/edg/i)) {
      browserName = "Edge";
    } else {
      browserName = "Unknown";
    }
    
    return browserName;
  };

  return {
    permissionDenied,
    microphoneAvailable,
    browserSupport,
    getBrowserName
  };
};
