/**
 * Client utility for mobile app to submit audio for grading and retrieve results.
 * This handles uploading the recorded performance audio to the grading API.
 */
import type { PerformanceGradeResult } from "@metalmaster/shared";

const API_BASE =
  process.env.EXPO_PUBLIC_AI_API_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  '';
const GRADING_API_URL = API_BASE ? `${API_BASE.replace(/\/$/, '')}/grading` : '';

/**
 * Uploads a recorded performance audio file to the server for grading.
 * @param fileUri URI or path to the audio file on the device (e.g., from Expo FileSystem or recorder output).
 * @param pieceId Identifier of the piece/song to grade (used to retrieve expected note timings on server).
 * @returns The grading result from the server.
 */
export async function gradePerformanceRecording(
  fileUri: string,
  pieceId: string,
): Promise<PerformanceGradeResult> {
  if (!GRADING_API_URL) {
    throw new Error('EXPO_PUBLIC_AI_API_URL or EXPO_PUBLIC_API_URL is not set; cannot submit grading request.');
  }
  // Prepare form data with the audio file and piece identifier
  const formData = new FormData();
  // Append audio file; on React Native/Expo, we provide the URI and file info
  formData.append("file", {
    uri: fileUri,
    type: "audio/wav", // assuming the recording is saved as WAV (adjust type if needed)
    name: "performance.wav",
  } as any);
  formData.append("pieceId", pieceId);

  // Perform the API request
  const response = await fetch(GRADING_API_URL, {
    method: "POST",
    body: formData,
    // Note: No need to manually set Content-Type for multipart/form-data; fetch will handle the boundary.
  });
  if (!response.ok) {
    // Handle error response
    const errText = await response.text();
    throw new Error(
      `Grading request failed: ${response.status} ${response.statusText} - ${errText}`,
    );
  }
  // Parse the JSON result
  const result: PerformanceGradeResult = await response.json();
  return result;
}

// Usage example (within an async function in the mobile app):
// try {
//   const gradeResult = await gradePerformanceRecording(recordedFileUri, currentPieceId);
//   // Use gradeResult (e.g., navigate to a result screen or update state for display)
// } catch (e) {
//   console.error("Grading failed", e);
//   // Show an error message to the user
// }
