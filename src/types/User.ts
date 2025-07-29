export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    phone?: string;
    whatsapp?: string;
    interests?: string[];
    budgetRange?: {
        min: number;
        max: number;
    };
    location?: string;
    role: 'user' | 'admin' | 'super_admin';
    createdAt: any;
    lastLogin?: any;
    isOnboarded: boolean;
}

export interface OnboardingData {
    displayName: string;
    phone: string;
    whatsapp: string;
    interests: string[];
    budgetRange: {
        min: number;
        max: number;
    };
    location: string;
}

export interface PropertyInterest {
    id: string;
    type: 'residential' | 'commercial' | 'agricultural' | 'industrial';
    preferredLocations: string[];
    budgetRange: {
        min: number;
        max: number;
    };
    propertySize?: {
        min: number;
        max: number;
        unit: 'sqft' | 'acres' | 'cents';
    };
} 