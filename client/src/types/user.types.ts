export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isMe: boolean;
}

export interface UpdateProfileInput {
  username?: string;
  bio?: string;
}

export interface AuthorSummary {
  _id: string;
  username: string;
  avatar: string;
}
