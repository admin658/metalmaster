import { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';

export function useAudioRecorder(apiUrl: string) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  async function requestPermission() {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      setError('Microphone permission not granted');
      return false;
    }
    return true;
  }

  async function startRecording() {
    setError(null);
    const hasPerm = await requestPermission();
    if (!hasPerm) return;
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      recordingRef.current = rec;
      setIsRecording(true);
    } catch (e) {
      setError('Failed to start recording');
    }
  }

  async function stopRecording() {
    setError(null);
    try {
      const rec = recordingRef.current;
      if (!rec) return;
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      setAudioUri(uri);
      setRecording(null);
      recordingRef.current = null;
      setIsRecording(false);
      return uri;
    } catch (e) {
      setError('Failed to stop recording');
    }
  }

  async function uploadRecording() {
    setError(null);
    if (!audioUri) {
      setError('No audio to upload');
      return;
    }
    setUploading(true);
    try {
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        name: 'recording.wav',
        type: 'audio/wav',
      } as any);
      const res = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploading(false);
      return await res.json();
    } catch (e) {
      setError('Upload failed');
      setUploading(false);
    }
  }

  return {
    isRecording,
    audioUri,
    error,
    uploading,
    startRecording,
    stopRecording,
    uploadRecording,
  };
}
