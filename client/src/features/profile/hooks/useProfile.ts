import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getProfileApi,
  updateProfileApi,
  uploadAvatarApi,
  followApi,
  unfollowApi,
} from "../../../api/user.api";
import { useAuthStore } from "../../auth/store/authStore";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../../types/user.types";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.message ?? "Đã có lỗi xảy ra";
  }
  return "Đã có lỗi xảy ra";
};

export const useProfile = (username: string) => {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: () => getProfileApi(username),
    enabled: !!username,
  });
};

export const useUpdateProfile = (username: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      toast.success("Cập nhật profile thành công");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const setAvatarInStore = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: uploadAvatarApi,
    onSuccess: (data) => {
      if (setAvatarInStore) {
        useAuthStore
          .getState()
          .setAuth(
            { ...setAvatarInStore, avatar: data.avatar },
            useAuthStore.getState().accessToken as string
          );
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Cập nhật avatar thành công");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useFollowToggle = (username: string) => {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: () => followApi(username),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["profile", username] });
      const previous = queryClient.getQueryData(["profile", username]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(["profile", username], (old: any) =>
        old ? { ...old, isFollowing: true, followersCount: old.followersCount + 1 } : old
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      queryClient.setQueryData(["profile", username], context?.previous);
      toast.error(getErrorMessage(error));
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowApi(username),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["profile", username] });
      const previous = queryClient.getQueryData(["profile", username]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(["profile", username], (old: any) =>
        old ? { ...old, isFollowing: false, followersCount: old.followersCount - 1 } : old
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      queryClient.setQueryData(["profile", username], context?.previous);
      toast.error(getErrorMessage(error));
    },
  });

  return { followMutation, unfollowMutation };
};
