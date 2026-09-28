import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProfile } from "../features/profile/hooks/useProfile";
import { ProfileHeader } from "../features/profile/components/ProfileHeader";
import { EditProfileModal } from "../features/profile/components/EditProfileModal";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const { data: profile, isLoading, isError } = useProfile(username ?? "");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist">
        <p className="font-sans text-sm text-ink/40">Đang tải...</p>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist">
        <p className="font-sans text-sm text-ink/40">Không tìm thấy người dùng</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <ProfileHeader profile={profile} onEditClick={() => setIsEditing(true)} />
      </div>

      {isEditing && <EditProfileModal profile={profile} onClose={() => setIsEditing(false)} />}
    </div>
  );
}
