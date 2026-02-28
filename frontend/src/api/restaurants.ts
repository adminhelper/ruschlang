import { api } from './client';
import type { Restaurant, RestaurantCreateRequest, ReviewCreateRequest, Review } from '../types/restaurant';

export async function getRestaurants(sort: string = 'latest'): Promise<Restaurant[]> {
  return api.get<Restaurant[]>('/api/restaurants', { sort });
}

export async function createRestaurant(data: RestaurantCreateRequest): Promise<Restaurant> {
  return api.post<Restaurant>('/api/restaurants', data);
}

export async function deleteRestaurant(id: string): Promise<void> {
  return api.delete(`/api/restaurants/${id}`);
}

export async function getReviews(restaurantId: string): Promise<Review[]> {
  return api.get<Review[]>(`/api/restaurants/${restaurantId}/reviews`);
}

export async function createReview(restaurantId: string, data: ReviewCreateRequest): Promise<Review> {
  return api.post<Review>(`/api/restaurants/${restaurantId}/reviews`, data);
}
