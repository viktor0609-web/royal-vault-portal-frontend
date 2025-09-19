import React, { useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { ProgressBar } from './progress-bar';
import { Button } from './button';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadWithProgressProps {
    onFileUploaded: (fileUrl: string, fileName: string) => void;
    accept?: string;
    maxSize?: number; // in MB
    className?: string;
    disabled?: boolean;
}

export const FileUploadWithProgress: React.FC<FileUploadWithProgressProps> = ({
    onFileUploaded,
    accept = '*/*',
    maxSize = 500, // 500MB default
    className,
    disabled = false
}) => {
    const { uploadFile, isUploading, uploadError } = useFileUpload();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check file size
            if (file.size > maxSize * 1024 * 1024) {
                setUploadStatus('error');
                return;
            }
            setSelectedFile(file);
            setUploadStatus('idle');
            setUploadProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploadStatus('uploading');
        setUploadProgress(0);

        try {
            const response = await uploadFile(selectedFile, (progress) => {
                setUploadProgress(progress.percentage);
            });

            setUploadStatus('success');
            onFileUploaded(response.url, response.originalName || selectedFile.name);
        } catch (error) {
            setUploadStatus('error');
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setUploadStatus('idle');
        setUploadProgress(0);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={className}>
            {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                        type="file"
                        accept={accept}
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                        disabled={disabled}
                    />
                    <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                        <Upload className="h-8 w-8 text-gray-400" />
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-blue-600 hover:text-blue-500">
                                Click to upload
                            </span>
                            {' '}or drag and drop
                        </div>
                        <div className="text-xs text-gray-500">
                            Max size: {maxSize}MB
                        </div>
                    </label>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* File Info */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                {uploadStatus === 'success' ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : uploadStatus === 'error' ? (
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                ) : (
                                    <Upload className="h-5 w-5 text-gray-400" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            disabled={isUploading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Upload Progress */}
                    {uploadStatus === 'uploading' && (
                        <div className="space-y-2">
                            <ProgressBar progress={uploadProgress} size="md" />
                            <p className="text-xs text-gray-600 text-center">
                                Uploading... {uploadProgress}%
                            </p>
                        </div>
                    )}

                    {/* Upload Button */}
                    {uploadStatus === 'idle' && (
                        <Button
                            onClick={handleUpload}
                            disabled={disabled}
                            className="w-full"
                        >
                            Upload File
                        </Button>
                    )}

                    {/* Success Message */}
                    {uploadStatus === 'success' && (
                        <div className="text-center text-green-600 text-sm">
                            File uploaded successfully!
                        </div>
                    )}

                    {/* Error Message */}
                    {uploadStatus === 'error' && (
                        <div className="text-center text-red-600 text-sm">
                            {uploadError || 'Upload failed. Please try again.'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
