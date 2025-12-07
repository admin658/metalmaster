import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface AIFeedbackScreenProps {
  apiUrl: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  recordButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  recordButtonRed: {
    backgroundColor: '#b91c1c',
  },
  recordButtonGreen: {
    backgroundColor: '#15803d',
  },
  uploadButton: {
    backgroundColor: '#b45309',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorText: {
    color: '#f87171',
    marginBottom: 8,
  },
});

export const AIFeedbackScreen = ({ apiUrl }: AIFeedbackScreenProps) => {
  const {
    isRecording,
    audioUri,
    error,
    uploading,
    startRecording,
    stopRecording,
    uploadRecording,
  } = useAudioRecorder(apiUrl);
  const [result, setResult] = useState<AIFeedbackResultProps | null>(null);

  const handleRecord = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleUpload = async () => {
    const res = await uploadRecording();
    setResult(res);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Feedback</Text>
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording ? styles.recordButtonRed : styles.recordButtonGreen,
        ]}
        onPress={handleRecord}
      >
        <Text style={styles.buttonText}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </TouchableOpacity>
      {audioUri && !isRecording && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUpload}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>
            {uploading ? 'Uploading...' : 'Upload & Analyze'}
          </Text>
        </TouchableOpacity>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {result && <AIFeedbackResult {...result} />}
    </View>
  );
};

interface AIFeedbackResultProps {
  accuracy: number;
  timing_deviation: number;
  noise_score: number;
  pick_attack_score: number;
}

const resultStyles = StyleSheet.create({
  resultContainer: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  resultTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultLabel: {
    color: '#d1d5db',
    marginBottom: 4,
  },
  resultValue: {
    color: '#facc15',
  },
});

export const AIFeedbackResult = ({
  accuracy,
  timing_deviation,
  noise_score,
  pick_attack_score,
}: AIFeedbackResultProps) => (
  <View style={resultStyles.resultContainer}>
    <Text style={resultStyles.resultTitle}>Results</Text>
    <Text style={resultStyles.resultLabel}>
      Accuracy:{' '}
      <Text style={resultStyles.resultValue}>
        {(accuracy * 100).toFixed(1)}%
      </Text>
    </Text>
    <Text style={resultStyles.resultLabel}>
      Timing Deviation:{' '}
      <Text style={resultStyles.resultValue}>
        {timing_deviation.toFixed(3)}s
      </Text>
    </Text>
    <Text style={resultStyles.resultLabel}>
      Noise Score:{' '}
      <Text style={resultStyles.resultValue}>
        {(noise_score * 100).toFixed(1)}%
      </Text>
    </Text>
    <Text style={resultStyles.resultLabel}>
      Pick Attack:{' '}
      <Text style={resultStyles.resultValue}>
        {(pick_attack_score * 100).toFixed(1)}%
      </Text>
    </Text>
  </View>
);

// Usage: <AIFeedbackScreen apiUrl="http://localhost:8000/feedback" />
