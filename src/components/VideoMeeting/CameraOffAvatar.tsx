import React from 'react';

interface CameraOffAvatarProps {
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const CameraOffAvatar: React.FC<CameraOffAvatarProps> = ({
    name,
    size = 'md',
    className = ''
}) => {
    // Get the first letter of the name and convert to uppercase
    const initial = name?.charAt(0)?.toUpperCase() || '?';

    // Define size classes
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-12 h-12 text-lg',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-20 h-20 text-2xl'
    };

    // Generate a consistent background color based on the name
    const getBackgroundColor = (name: string) => {
        const colors = [
            'bg-blue-600',
            'bg-green-600',
            'bg-purple-600',
            'bg-red-600',
            'bg-yellow-600',
            'bg-indigo-600',
            'bg-pink-600',
            'bg-teal-600',
            'bg-orange-600',
            'bg-cyan-600'
        ];

        // Use the first character's char code to pick a consistent color
        const charCode = name.charCodeAt(0);
        return colors[charCode % colors.length];
    };

    return (
        <div
            className={`
        ${sizeClasses[size]} 
        ${getBackgroundColor(name)}
        rounded-full 
        flex 
        items-center 
        justify-center 
        text-white 
        font-semibold 
        shadow-lg
        ${className}
      `}
        >
            {initial}
        </div>
    );
};
