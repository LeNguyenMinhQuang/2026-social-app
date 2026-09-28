import { axiosClient } from "./axiosClient";
import type { ApiResponse, Profile, UpdateProfileInput, User } from "../types/user.types";

export const getProfileApi = async (username: string): Promise<Profile> => {
  const { data } = await axiosClient.get<ApiResponse<{ profile: Profile }>>(`/users/${username}`);
  return data.data.profile;
};

export const updateProfileApi = async (input: UpdateProfileInput): Promise<User> => {
  const { data } = await axiosClient.patch<ApiResponse<{ user: User }>>("/users/me", input);
  return data.data.user;
};

export const uploadAvatarApi = async (file: File): Promise<{ avatar: string }> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await axiosClient.post<ApiResponse<{ avatar: string }>>(
    "/users/me/avatar",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
};

export const followApi = async (username: string): Promise<{ isFollowing: boolean }> => {
  const { data } = await axiosClient.post<ApiResponse<{ isFollowing: boolean }>>(
    `/users/${username}/follow`
  );
  return data.data;
};

export const unfollowApi = async (username: string): Promise<{ isFollowing: boolean }> => {
  const { data } = await axiosClient.delete<ApiResponse<{ isFollowing: boolean }>>(
    `/users/${username}/follow`
  );
  return data.data;
};
