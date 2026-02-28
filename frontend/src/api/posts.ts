import { api } from './client';
import type { Post, PostCreateRequest, PostComment, CommentCreateRequest } from '../types/post';

export async function getPosts(status?: string): Promise<Post[]> {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  return api.get<Post[]>('/api/posts', params);
}

export async function createPost(data: PostCreateRequest): Promise<Post> {
  return api.post<Post>('/api/posts', data);
}

export async function updatePost(id: string, data: Partial<PostCreateRequest>): Promise<Post> {
  return api.put<Post>(`/api/posts/${id}`, data);
}

export async function deletePost(id: string): Promise<void> {
  return api.delete(`/api/posts/${id}`);
}

export async function approvePost(id: string, status: 'approved' | 'rejected'): Promise<Post> {
  return api.patch<Post>(`/api/posts/${id}/approve`, { status });
}

export async function getComments(postId: string): Promise<PostComment[]> {
  return api.get<PostComment[]>(`/api/posts/${postId}/comments`);
}

export async function createComment(postId: string, data: CommentCreateRequest): Promise<PostComment> {
  return api.post<PostComment>(`/api/posts/${postId}/comments`, data);
}
