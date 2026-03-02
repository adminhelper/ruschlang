export interface Restaurant {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
  reviews: Review[];
}

export interface Review {
  id: string;
  restaurantId: string;
  name: string;
  generation?: number;
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
  description: string;
  photoUrl: string;
}

export interface ReviewCreateRequest {
  name: string;
  generation?: number;
  rating: number;
  note: string;
  photoUrl: string;
}
