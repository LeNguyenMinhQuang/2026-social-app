import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCommentsApi, createCommentApi, deleteCommentApi } from "../../../api/comment.api";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../types/user.types";
import type { CommentsResponse } from "../../../types/post.types";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.message ?? "Đã có lỗi xảy ra";
  }
  return "Đã có lỗi xảy ra";
};

export const useComments = (postId: string, enabled: boolean) => {
  return useInfiniteQuery<CommentsResponse>({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }) => getCommentsApi(postId, pageParam as string | undefined),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });
};

export const useCreateComment = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => createCommentApi(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteComment = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteCommentApi(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};
