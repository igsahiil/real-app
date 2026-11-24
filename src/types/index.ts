export type UserRole = 'admin' | 'agent' | 'user';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isBlocked: boolean;
  avatar?: string;
}

export interface AgentProfile {
  _id: string;
  userId: string;
  agencyName?: string;
  licenseNo?: string;
  idProofUrl?: string;
  address?: string;
  bio?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
}

export type PropertyListingType = 'sale' | 'rent' | 'lease';
export type PropertyCategory = 'residential' | 'commercial' | 'plot_land';
export type PropertyStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'sold' | 'rented' | 'expired' | 'paused';

export interface PropertyLocation {
  country: string;
  state: string;
  city: string;
  locality: string;
  society?: string;
  pincode: string;
  address: string;
  geo?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  boundary?: {
    type: 'Polygon';
    coordinates: [number, number][][]; // [[[lng, lat], ...]]
  };
}

export interface PropertyImage {
  url: string;
  publicId: string;
  isCover: boolean;
}

export interface Property {
  _id: string;
  agentId: string;
  title: string;
  slug: string;
  description: string;
  listingType: PropertyListingType;
  category: PropertyCategory;
  propertyType: string;
  price: number;
  priceNegotiable: boolean;
  maintenance?: number;
  securityDeposit?: number;
  location: PropertyLocation;
  details: Record<string, unknown>;
  amenities: string[];
  images: PropertyImage[];
  videoUrl?: string;
  floorPlanUrl?: string;
  status: PropertyStatus;
  rejectionReason?: string;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface MasterDataItem {
  _id: string;
  type: 'city' | 'locality' | 'property_type' | 'amenity';
  name: string;
  code?: string;
  category?: string;
  parent?: string;
  icon?: string;
  isActive: boolean;
  order: number;
}
