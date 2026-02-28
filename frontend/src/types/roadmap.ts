export interface Roadmap {
  id: string;
  title: string;
  author: string;
  description: string;
  stops: string;
  rating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Stop {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface RoadmapCreateRequest {
  title: string;
  author: string;
  description: string;
  stops: string;
}

export interface RoadmapRateRequest {
  rating: number;
}
