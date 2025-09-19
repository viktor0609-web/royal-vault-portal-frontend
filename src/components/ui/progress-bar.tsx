import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    progress: number;
    className?: string;
    showPercentage?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    className,
    showPercentage = true,
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4'
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    return (
        <div className={cn('w-full', className)}>
            <div className={cn(
                'bg-gray-200 rounded-full overflow-hidden',
                sizeClasses[size]
            )}>
                <div
                    className={cn(
                        'bg-blue-600 transition-all duration-300 ease-out rounded-full',
                        sizeClasses[size]
                    )}
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>
            {showPercentage && (
                <div className={cn(
                    'mt-1 text-center text-gray-600 font-medium',
                    textSizeClasses[size]
                )}>
                    {Math.round(progress)}%
                </div>
            )}
        </div>
    );
};
