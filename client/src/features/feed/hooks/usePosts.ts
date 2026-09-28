import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getFeedApi, createPostApi, deletePostApi, toggleLikeApi } from "../../../api/post.api";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../types/user.types";
import type { FeedResponse } from "../../../types/post.types";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.message ?? "Đã có lỗi xảy ra";
  }
  return "Đã có lỗi xảy ra";
};

export const useFeed = () => {
  return useInfiniteQuery<FeedResponse>({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => getFeedApi(pageParam as string | undefined),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, images }: { content: string; images: File[] }) =>
      createPostApi(content, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Đã đăng bài");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePostApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Đã xóa bài viết");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLikeApi,
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueryData<{ pages: FeedResponse[] }>(["feed"]);

      queryClient.setQueryData<{ pages: FeedResponse[]; pageParams: unknown[] }>(
        ["feed"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      isLiked: !post.isLiked,
                      likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
                    }
                  : post
              ),
            })),
          };
        }
      );

      return { previous };
    },
    onError: (error, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["feed"], context.previous);
      }
      toast.error(getErrorMessage(error));
    },
  });
};
