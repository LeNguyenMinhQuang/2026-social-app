import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import imageCompression from "browser-image-compression";
import { editProfileFormSchema, type EditProfileFormValues } from "../schema/profile.schema";
import { useUpdateProfile, useUploadAvatar } from "../hooks/useProfile";
import { FormField } from "../../../components/common/FormField";
import { Button } from "../../../components/common/Button";
import type { Profile } from "../../../types/user.types";

interface EditProfileModalProps {
  profile: Profile;
  onClose: () => void;
}

export function EditProfileModal({ profile, onClose }: EditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile(profile.username);
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileFormSchema),
    defaultValues: { username: profile.username, bio: profile.bio },
  });

  const onSubmit = (data: EditProfileFormValues) => {
    updateProfile(data, { onSuccess: onClose });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 512,
    });

    uploadAvatar(compressedFile as File);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-md rounded-[10px] bg-mist p-6">
        <h2 className="font-display text-xl text-ink">Chỉnh sửa profile</h2>

        <div className="mt-5 flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-line">
            {profile.avatar && (
              <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button
            className="w-auto bg-transparent px-4 py-2 text-ink outline outline-1 outline-line hover:bg-line/30"
            isLoading={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            Đổi avatar
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-5">
          <FormField
            id="username"
            label="Username"
            error={errors.username?.message}
            {...register("username")}
          />
          <FormField id="bio" label="Bio" error={errors.bio?.message} {...register("bio")} />

          <div className="mt-2 flex gap-3">
            <Button type="submit" isLoading={isUpdating}>
              Lưu thay đổi
            </Button>
            <Button
              type="button"
              className="bg-transparent text-ink outline outline-1 outline-line hover:bg-line/30"
              onClick={onClose}
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
