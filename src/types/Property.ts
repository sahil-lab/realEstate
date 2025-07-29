export interface Property {
    _id: string;
    title: string;
    description: string;
    type: 'residential' | 'commercial' | 'agricultural' | 'industrial';
    price: number;
    location: {
        address: string;
        city: string;
        state: string;
        pincode: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    specifications: {
        area: number;
        areaUnit: 'sqft' | 'acres' | 'cents';
        bedrooms?: number;
        bathrooms?: number;
        parking?: number;
        floors?: number;
    };
    amenities: string[];
    images: string[];
    features: string[];
    status: 'active' | 'sold' | 'pending' | 'deleted';
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PropertyFilter {
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    minArea?: number;
    maxArea?: number;
    bedrooms?: number;
    bathrooms?: number;
}

export interface Inquiry {
    _id: string;
    userId: string;
    propertyId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    message: string;
    status: 'pending' | 'contacted' | 'interested' | 'not_interested' | 'closed';
    createdAt: Date;
    updatedAt?: Date;
}

export interface Favorite {
    _id: string;
    userId: string;
    propertyId: string;
    createdAt: Date;
}

export interface PropertyStats {
    totalProperties: number;
    activeProperties: number;
    soldProperties: number;
    pendingProperties: number;
    totalInquiries: number;
    pendingInquiries: number;
} 