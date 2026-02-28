import { api } from './client';
import type { Roadmap, RoadmapCreateRequest, RoadmapRateRequest } from '../types/roadmap';

export async function getRoadmaps(): Promise<Roadmap[]> {
  return api.get<Roadmap[]>('/api/roadmaps');
}

export async function createRoadmap(data: RoadmapCreateRequest): Promise<Roadmap> {
  return api.post<Roadmap>('/api/roadmaps', data);
}

export async function updateRoadmap(id: string, data: RoadmapCreateRequest): Promise<Roadmap> {
  return api.put<Roadmap>(`/api/roadmaps/${id}`, data);
}

export async function deleteRoadmap(id: string): Promise<void> {
  return api.delete(`/api/roadmaps/${id}`);
}

export async function rateRoadmap(id: string, data: RoadmapRateRequest): Promise<Roadmap> {
  return api.post<Roadmap>(`/api/roadmaps/${id}/rate`, data);
}
