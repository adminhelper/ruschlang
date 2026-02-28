export type UserRole = 'guest' | 'member' | 'admin';

export type RuschlangGrade = '5star' | '4star' | '3star' | 'newbie';

export interface AdminSession {
  token: string;
  loginAt: number;
}

export interface MemberSession {
  nickname: string;
  loginAt: number;
}

export interface AuthState {
  role: UserRole;
  nickname: string;
  adminToken: string;
}

export const ADMIN_SESSION_KEY = 'ruschlang:admin:session';
export const MEMBER_SESSION_KEY = 'ruschlang:member:session';
export const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const MEMBER_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
