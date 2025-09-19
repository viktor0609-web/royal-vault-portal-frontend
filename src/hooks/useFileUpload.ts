import { useState, useCallback } from 'react';
import { fileApi } from '@/lib/api';

interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

interface UseFileUploadReturn {
    uploadFile: (file: File, onProgress?: (progress: UploadProgress) => void) => Promise<any>;
    isUploading: boolean;
    uploadError: string | null;
}

export const useFileUpload = (): UseFileUploadReturn => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const uploadFile = useCallback(async (file: File, onProgress?: (progress: UploadProgress) => void) => {
        setIsUploading(true);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fileApi.uploadFile(formData, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const progress: UploadProgress = {
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        };
                        onProgress(progress);
                    }
                }
            });

            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to upload file';
            setUploadError(errorMessage);
            throw error;
        } finally {
            setIsUploading(false);
        }
    }, []);

    return {
        uploadFile,
        isUploading,
        uploadError
    };
};
