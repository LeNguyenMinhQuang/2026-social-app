import type { AuthorSummary } from "./user.types";

export interface Post {
  id: string;
  author: AuthorSummary;
  content: string;
  images: string[];
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  createdAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: AuthorSummary;
  content: string;
  createdAt: string;
}

export interface FeedResponse {
  posts: Post[];
  nextCursor: string | null;
}

export interface CommentsResponse {
  comments: Comment[];
  nextCursor: string | null;
}
