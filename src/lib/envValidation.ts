// Environment variable validation utility
// This helps ensure all required environment variables are properly configured

interface EnvConfig {
    VITE_BACKEND_URL: string;
    VITE_YOUTUBE_API_KEY: string;
    VITE_YOUTUBE_CLIENT_ID: string;
    VITE_YOUTUBE_CLIENT_SECRET: string;
}

class EnvValidator {
    private config: EnvConfig;
    private errors: string[] = [];

    constructor() {
        this.config = {
            VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL || '',
            VITE_YOUTUBE_API_KEY: import.meta.env.VITE_YOUTUBE_API_KEY || '',
            VITE_YOUTUBE_CLIENT_ID: import.meta.env.VITE_YOUTUBE_CLIENT_ID || '',
            VITE_YOUTUBE_CLIENT_SECRET: import.meta.env.VITE_YOUTUBE_CLIENT_SECRET || '',
        };
    }

    validate(): { isValid: boolean; errors: string[]; config: EnvConfig } {
        this.errors = [];
        this.validateBackendUrl();
        this.validateYouTubeApiKey();
        this.validateYouTubeClientId();
        this.validateYouTubeClientSecret();

        return {
            isValid: this.errors.length === 0,
            errors: this.errors,
            config: this.config
        };
    }

    private validateBackendUrl(): void {
        if (!this.config.VITE_BACKEND_URL) {
            this.errors.push('VITE_BACKEND_URL is required');
            return;
        }

        try {
            new URL(this.config.VITE_BACKEND_URL);
        } catch {
            this.errors.push('VITE_BACKEND_URL must be a valid URL');
        }
    }

    private validateYouTubeApiKey(): void {
        if (!this.config.VITE_YOUTUBE_API_KEY) {
            this.errors.push('VITE_YOUTUBE_API_KEY is required for video uploads');
            return;
        }

        if (this.config.VITE_YOUTUBE_API_KEY === 'your_youtube_api_key_here') {
            this.errors.push('VITE_YOUTUBE_API_KEY must be replaced with your actual API key');
        }

        if (this.config.VITE_YOUTUBE_API_KEY.length < 20) {
            this.errors.push('VITE_YOUTUBE_API_KEY appears to be invalid (too short)');
        }
    }

    private validateYouTubeClientId(): void {
        if (!this.config.VITE_YOUTUBE_CLIENT_ID) {
            this.errors.push('VITE_YOUTUBE_CLIENT_ID is required for video uploads');
            return;
        }

        if (this.config.VITE_YOUTUBE_CLIENT_ID === 'your_youtube_client_id_here') {
            this.errors.push('VITE_YOUTUBE_CLIENT_ID must be replaced with your actual client ID');
        }

        if (!this.config.VITE_YOUTUBE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
            this.errors.push('VITE_YOUTUBE_CLIENT_ID must be a valid Google OAuth client ID');
        }
    }

    private validateYouTubeClientSecret(): void {
        if (!this.config.VITE_YOUTUBE_CLIENT_SECRET) {
            this.errors.push('VITE_YOUTUBE_CLIENT_SECRET is required for OAuth token exchange');
            return;
        }

        if (this.config.VITE_YOUTUBE_CLIENT_SECRET === 'your_youtube_client_secret_here') {
            this.errors.push('VITE_YOUTUBE_CLIENT_SECRET must be replaced with your actual client secret');
        }

        if (this.config.VITE_YOUTUBE_CLIENT_SECRET.length < 20) {
            this.errors.push('VITE_YOUTUBE_CLIENT_SECRET appears to be invalid (too short)');
        }
    }

    getConfig(): EnvConfig {
        return this.config;
    }

    getErrors(): string[] {
        return this.errors;
    }

    hasErrors(): boolean {
        return this.errors.length > 0;
    }
}

// Export singleton instance
export const envValidator = new EnvValidator();

// Export validation function for easy use
export const validateEnvironment = () => {
    return envValidator.validate();
};

// Export config getter
export const getEnvConfig = () => {
    return envValidator.getConfig();
};

// Development helper - log environment status
export const logEnvironmentStatus = () => {
    if (import.meta.env.DEV) {
        const validation = validateEnvironment();

        console.group('🔧 Environment Configuration');

        if (validation.isValid) {
            console.log('✅ All environment variables are properly configured');
        } else {
            console.warn('⚠️ Environment configuration issues detected:');
            validation.errors.forEach(error => {
                console.warn(`  - ${error}`);
            });
        }

        console.log('📋 Current configuration:');
        console.table(validation.config);

        console.groupEnd();
    }
};

// Auto-validate on import in development
if (import.meta.env.DEV) {
    logEnvironmentStatus();
}
