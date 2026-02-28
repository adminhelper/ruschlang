export interface Restaurant {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  region: string;
  phone: string;
  description: string;
  photoUrl: string;
  rating: number;
  reviewCount: number;
  ruschlangGrade: RuschlangGrade;
  createdAt: string;
  updatedAt: string;
  reviews: Review[];
}

export interface Review {
  id: string;
  restaurantId: string;
  name: string;
  rating: number;
  note: string;
  photoUrl: string;
  createdAt: string;
}

export interface RestaurantCreateRequest {
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  region: string;
  phone: string;
  description: string;
  photo: string;
}

export interface ReviewCreateRequest {
  name: string;
  rating: number;
  note: string;
  photo: string;
}

export type RuschlangGrade = '5star' | '4star' | '3star' | 'newbie';
