export interface Post {
  id: string;
  title: string;
  author: string;
  authorRole: UserRole;
  content: string;
  photo: string;
  locationName: string;
  locationLat: number | null;
  locationLng: number | null;
  rating: number | null;
  ruschlangGrade: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  comments: PostComment[];
}

export interface PostComment {
  id: string;
  postId: string;
  parentCommentId: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface CommentNode extends PostComment {
  children: CommentNode[];
}

export interface PostCreateRequest {
  title: string;
  author: string;
  authorRole: string;
  content: string;
  photo?: string;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  rating?: number;
}

export interface CommentCreateRequest {
  author: string;
  content: string;
  parentCommentId?: string;
}

export type PostStatus = 'pending' | 'approved' | 'rejected';

type UserRole = 'guest' | 'member' | 'admin';
