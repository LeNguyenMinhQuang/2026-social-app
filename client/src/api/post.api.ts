import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types/user.types";
import type { FeedResponse, Post } from "../types/post.types";

export const getFeedApi = async (cursor?: string): Promise<FeedResponse> => {
  const { data } = await axiosClient.get<ApiResponse<FeedResponse>>("/posts/feed", {
    params: cursor ? { cursor } : undefined,
  });
  return data.data;
};

export const createPostApi = async (content: string, images: File[]): Promise<Post> => {
  const formData = new FormData();
  formData.append("content", content);
  images.forEach((file) => formData.append("images", file));

  const { data } = await axiosClient.post<ApiResponse<{ post: Post }>>("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.post;
};

export const deletePostApi = async (postId: string): Promise<void> => {
  await axiosClient.delete(`/posts/${postId}`);
};

export const toggleLikeApi = async (
  postId: string
): Promise<{ liked: boolean; likesCount: number }> => {
  const { data } = await axiosClient.post<ApiResponse<{ liked: boolean; likesCount: number }>>(
    `/posts/${postId}/like`
  );
  return data.data;
};
