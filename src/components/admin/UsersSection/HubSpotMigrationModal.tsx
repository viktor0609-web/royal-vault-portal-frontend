import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RefreshCw, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MigrationProgress {
    type: 'connected' | 'progress' | 'completed' | 'error' | 'paused' | 'resumed' | 'status';
    migrationId?: string;
    message?: string;
    totalProcessed?: number;
    totalCreated?: number;
    totalSkipped?: number;
    totalErrors?: number;
    isPaused?: boolean;
    isCompleted?: boolean;
    errors?: Array<{ contact: string; email?: string; reason: string }>;
    summary?: {
        totalProcessed: number;
        totalCreated: number;
        totalSkipped: number;
        totalErrors: number;
    };
}

interface HubSpotMigrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: () => void;
}

export function HubSpotMigrationModal({ isOpen, onClose, onComplete }: HubSpotMigrationModalProps) {
    const { toast } = useToast();
    const [isMigrating, setIsMigrating] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState<MigrationProgress | null>(null);
    const [migrationId, setMigrationId] = useState<string | null>(null);
    const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

    useEffect(() => {
        return () => {
            // Cleanup when component unmounts
            setIsMigrating(false);
        };
    }, []);

    const startMigration = async () => {
        const id = `migration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setMigrationId(id);
        setIsMigrating(true);
        setIsPaused(false);
        setProgress(null);

        // Get auth token from localStorage
        const token = localStorage.getItem('accessToken');
        if (!token) {
            toast({
                title: "Error",
                description: "Authentication required",
                variant: "destructive",
            });
            return;
        }

        try {
            // Use fetch with streaming for SSE (since EventSource doesn't support custom headers)
            const baseURL = import.meta.env.VITE_BACKEND_URL || '';
            const response = await fetch(
                `${baseURL}/api/users/migrate/hubspot?migrationId=${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'text/event-stream',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No response body');
            }

            readerRef.current = reader;
            let buffer = '';

            const readStream = async () => {
                try {
                    while (true) {
                        const { done, value } = await reader.read();

                        if (done) {
                            break;
                        }

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const data: MigrationProgress = JSON.parse(line.slice(6));
                                    setProgress(data);

                                    if (data.type === 'connected') {
                                        console.log('Connected to migration stream');
                                    } else if (data.type === 'progress') {
                                        // Update progress
                                    } else if (data.type === 'completed') {
                                        setIsMigrating(false);
                                        toast({
                                            title: "Migration Completed",
                                            description: `Created ${data.summary?.totalCreated || 0} users, skipped ${data.summary?.totalSkipped || 0} existing users.`,
                                        });
                                        if (onComplete) {
                                            onComplete();
                                        }
                                        return;
                                    } else if (data.type === 'error') {
                                        setIsMigrating(false);
                                        toast({
                                            title: "Migration Error",
                                            description: data.message || "An error occurred during migration",
                                            variant: "destructive",
                                        });
                                        return;
                                    } else if (data.type === 'paused') {
                                        setIsPaused(true);
                                        setIsMigrating(true); // Keep migration active but paused
                                    } else if (data.type === 'resumed') {
                                        setIsPaused(false);
                                        setIsMigrating(true);
                                    } else if (data.type === 'progress') {
                                        // Update isPaused state from progress data if available
                                        if ('isPaused' in data && data.isPaused !== undefined) {
                                            setIsPaused(data.isPaused);
                                        }
                                    } else if (data.type === 'status') {
                                        // Update state from status check
                                        if ('isPaused' in data && data.isPaused !== undefined) {
                                            setIsPaused(data.isPaused);
                                        }
                                        if ('isCompleted' in data && data.isCompleted) {
                                            setIsMigrating(false);
                                        }
                                    }
                                } catch (error) {
                                    console.error('Error parsing SSE data:', error);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Stream reading error:', error);
                    setIsMigrating(false);
                    toast({
                        title: "Connection Error",
                        description: "Lost connection to migration server",
                        variant: "destructive",
                    });
                }
            };

            readStream();
        } catch (error: any) {
            console.error('Migration start error:', error);
            setIsMigrating(false);
            toast({
                title: "Error",
                description: error.message || "Failed to start migration",
                variant: "destructive",
            });
        }
    };

    const pauseMigration = async () => {
        if (!migrationId) return;

        try {
            const token = localStorage.getItem('accessToken');
            const baseURL = import.meta.env.VITE_BACKEND_URL || '';
            await fetch(`${baseURL}/api/users/migrate/hubspot/pause?migrationId=${migrationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setIsPaused(true);
            toast({
                title: "Migration Paused",
                description: "Migration has been paused",
            });
        } catch (error: any) {
            console.error('Error pausing migration:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to pause migration",
                variant: "destructive",
            });
        }
    };

    const resumeMigration = async () => {
        if (!migrationId) return;

        try {
            const token = localStorage.getItem('accessToken');
            const baseURL = import.meta.env.VITE_BACKEND_URL || '';
            await fetch(`${baseURL}/api/users/migrate/hubspot/resume?migrationId=${migrationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setIsPaused(false);
            toast({
                title: "Migration Resumed",
                description: "Migration has been resumed",
            });
        } catch (error: any) {
            console.error('Error resuming migration:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to resume migration",
                variant: "destructive",
            });
        }
    };

    const stopMigration = () => {
        // Note: We can't directly stop a fetch stream, but we can mark it as stopped
        // The backend will continue, but we'll stop updating the UI
        setIsMigrating(false);
        setIsPaused(false);
        setProgress(null);
        setMigrationId(null);
    };

    const handleClose = () => {
        if (isMigrating) {
            // Ask for confirmation if migration is in progress
            if (window.confirm('Migration is in progress. Are you sure you want to close? The migration will continue in the background.')) {
                stopMigration();
                onClose();
            }
        } else {
            onClose();
        }
    };

    const calculateProgress = () => {
        if (!progress || !progress.totalProcessed) return 0;
        // Estimate progress based on processed contacts (assuming we don't know total)
        // This is a rough estimate - in a real scenario, you might want to get total from HubSpot first
        return Math.min(100, (progress.totalProcessed / 1000) * 100); // Assuming ~1000 contacts max
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>HubSpot Contact Migration</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="h-6 w-6"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                        Migrate contacts from HubSpot to your database. Existing users (by email) will be skipped.
                    </div>

                    {!isMigrating && !progress && (
                        <div className="flex justify-center">
                            <Button onClick={startMigration} className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Start Migration
                            </Button>
                        </div>
                    )}

                    {(isMigrating || (progress && progress.type !== 'completed')) && (
                        <>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Progress</span>
                                    <span className="text-gray-600">
                                        {progress?.totalProcessed || 0} processed
                                    </span>
                                </div>
                                <Progress value={calculateProgress()} className="h-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="text-green-600 font-medium">Created</div>
                                    <div className="text-2xl font-bold text-green-700">
                                        {progress?.totalCreated || 0}
                                    </div>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-lg">
                                    <div className="text-yellow-600 font-medium">Skipped</div>
                                    <div className="text-2xl font-bold text-yellow-700">
                                        {progress?.totalSkipped || 0}
                                    </div>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-blue-600 font-medium">Processed</div>
                                    <div className="text-2xl font-bold text-blue-700">
                                        {progress?.totalProcessed || 0}
                                    </div>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg">
                                    <div className="text-red-600 font-medium">Errors</div>
                                    <div className="text-2xl font-bold text-red-700">
                                        {progress?.totalErrors || 0}
                                    </div>
                                </div>
                            </div>

                            {progress?.message && (
                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    {progress.message}
                                </div>
                            )}

                            <div className="flex gap-2 justify-center">
                                {isPaused ? (
                                    <Button onClick={resumeMigration} variant="outline" className="flex items-center gap-2">
                                        <Play className="h-4 w-4" />
                                        Resume
                                    </Button>
                                ) : (
                                    <Button onClick={pauseMigration} variant="outline" className="flex items-center gap-2">
                                        <Pause className="h-4 w-4" />
                                        Pause
                                    </Button>
                                )}
                                <Button onClick={stopMigration} variant="destructive" className="flex items-center gap-2">
                                    <X className="h-4 w-4" />
                                    Stop
                                </Button>
                            </div>
                        </>
                    )}

                    {progress?.type === 'completed' && (
                        <div className="space-y-4">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="font-medium text-green-800 mb-2">Migration Completed!</div>
                                {progress.summary && (
                                    <div className="text-sm text-green-700 space-y-1">
                                        <div>Total Processed: {progress.summary.totalProcessed}</div>
                                        <div>Created: {progress.summary.totalCreated}</div>
                                        <div>Skipped: {progress.summary.totalSkipped}</div>
                                        <div>Errors: {progress.summary.totalErrors}</div>
                                    </div>
                                )}
                            </div>
                            {progress.errors && progress.errors.length > 0 && (
                                <div className="bg-yellow-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                                    <div className="font-medium text-yellow-800 mb-2">Errors ({progress.errors.length})</div>
                                    <div className="text-xs text-yellow-700 space-y-1">
                                        {progress.errors.slice(0, 10).map((error, idx) => (
                                            <div key={idx}>
                                                {error.email || error.contact}: {error.reason}
                                            </div>
                                        ))}
                                        {progress.errors.length > 10 && (
                                            <div>... and {progress.errors.length - 10} more errors</div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <Button onClick={handleClose} className="w-full">
                                Close
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

