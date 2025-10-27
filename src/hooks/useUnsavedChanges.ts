import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to track unsaved changes in forms
 * 
 * @param initialData - The initial state of the form data
 * @param currentData - The current state of the form data
 * @param additionalChanges - Additional conditions to check for changes (e.g., file uploads)
 * @returns Object with hasUnsavedChanges flag and reset function
 */
export function useUnsavedChanges<T extends Record<string, any>>(
    initialData: T | null,
    currentData: T,
    additionalChanges: boolean = false
) {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        if (!initialData) {
            setHasUnsavedChanges(false);
            return;
        }

        // Deep comparison of form data
        const hasChanges = Object.keys(currentData).some(key => {
            const currentValue = currentData[key];
            const initialValue = initialData[key];

            // Handle arrays
            if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
                return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
            }

            // Handle objects (but not null)
            if (
                typeof currentValue === 'object' &&
                currentValue !== null &&
                typeof initialValue === 'object' &&
                initialValue !== null
            ) {
                return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
            }

            // Handle primitives
            return currentValue !== initialValue;
        });

        setHasUnsavedChanges(hasChanges || additionalChanges);
    }, [initialData, currentData, additionalChanges]);

    const resetChanges = useCallback(() => {
        setHasUnsavedChanges(false);
    }, []);

    return { hasUnsavedChanges, resetChanges };
}

