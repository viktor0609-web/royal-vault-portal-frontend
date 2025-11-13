import { useState, useCallback } from 'react';
import axios from 'axios';
import { imageApi } from '@/lib/api';

interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

interface UseImageUploadReturn {
    uploadImage: (file: File, onProgress?: (progress: UploadProgress) => void) => Promise<any>;
    isUploading: boolean;
    uploadError: string | null;
}

export const useImageUpload = (): UseImageUploadReturn => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const uploadImage = useCallback(async (file: File, onProgress?: (progress: UploadProgress) => void) => {
        setIsUploading(true);
        setUploadError(null);

        try {
            // Step 1: Request signed upload URL from backend
            const signedUrlResponse = await imageApi.getSignedUploadUrl(file.name, file.type);
            const { signedUrl, token, publicUrl, path, filename } = signedUrlResponse.data;

            // Step 2: Upload image directly to Supabase Storage using signed URL
            // Note: Supabase Storage signed URLs typically use POST method
            await axios.put(signedUrl, file, {
                headers: {
                    'Content-Type': file.type,
                    'Authorization': `Bearer ${token}`,
                },
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

            // Step 3: Return the upload result with public URL
            return {
                message: 'Image uploaded successfully',
                url: publicUrl,
                filename: filename,
                originalName: file.name,
                mimetype: file.type,
                size: file.size,
                path: path
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image';
            setUploadError(errorMessage);
            throw error;
        } finally {
            setIsUploading(false);
        }
    }, []);

    return {
        uploadImage,
        isUploading,
        uploadError
    };
};

