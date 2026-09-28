import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types/user.types";
import type { Comment, CommentsResponse } from "../types/post.types";

export const getCommentsApi = async (
  postId: string,
  cursor?: string
): Promise<CommentsResponse> => {
  const { data } = await axiosClient.get<ApiResponse<CommentsResponse>>(
    `/posts/${postId}/comments`,
    { params: cursor ? { cursor } : undefined }
  );
  return data.data;
};

export const createCommentApi = async (postId: string, content: string): Promise<Comment> => {
  const { data } = await axiosClient.post<ApiResponse<{ comment: Comment }>>(
    `/posts/${postId}/comments`,
    { content }
  );
  return data.data.comment;
};

export const deleteCommentApi = async (postId: string, commentId: string): Promise<void> => {
  await axiosClient.delete(`/posts/${postId}/comments/${commentId}`);
};
