export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  totalReviews: number;
  categories: Category[];
  operatingHours: OperatingHours[];
  promotions: Promotion[];
  licenseNumber: string;
  licenseType: string;
}

export interface Category {
  id: string;
  name: string;
  items: MenuItem[];
  restaurantId: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  categoryId: string;
}

export interface OperatingHours {
  days: string;
  hours: string;
}

export interface Promotion {
  id: string;
  discountPercentage: number;
  minimumOrder: number;
  description: string;
  isAutoApplied: boolean;
  restaurantId: string;
}
