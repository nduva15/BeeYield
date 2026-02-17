import { DATA_API_URL } from "./api";

export interface KaggleInferenceResult {
    prediction: string;
    confidence: number;
    model_version: string;
    processing_time_ms: number;
    features?: number[];
    is_authenticated: boolean;
}

export const kaggleInferenceService = {
    /**
     * Trigger a remote inference job on Kaggle
     * @param audioUrl Publicly accessible URL to the audio file
     * @param hiveId ID of the hive being analyzed
     */
    async triggerRemoteInference(audioUrl: string, hiveId: string): Promise<{ job_id: string; status: string }> {
        try {
            // This calls our Go/Python backend which acts as the bridge to Kaggle API
            const response = await fetch(`${AI_API_URL}/acoustic/inference/trigger`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audio_url: audioUrl,
                    hive_id: hiveId,
                    model_type: 'sound_analysis'
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to trigger Kaggle inference: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Kaggle Inference Error:', error);
            throw error;
        }
    },

    /**
     * Polling or status check for an active Kaggle job
     */
    async getInferenceStatus(jobId: string): Promise<{ status: string; result?: KaggleInferenceResult }> {
        try {
            const response = await fetch(`${DATA_API_URL}/inference/kaggle/status/${jobId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch job status: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Job Status Error:', error);
            throw error;
        }
    }
};
