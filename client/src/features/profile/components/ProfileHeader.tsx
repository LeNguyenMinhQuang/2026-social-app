import { useAuthStore } from "../../auth/store/authStore";
import { useFollowToggle } from "../hooks/useProfile";
import { Button } from "../../../components/common/Button";
import type { Profile } from "../../../types/user.types";
import { useNavigate } from "react-router-dom";
import { useStartConversation } from "../../chat/hooks/useChat";

interface ProfileHeaderProps {
  profile: Profile;
  onEditClick: () => void;
}

export function ProfileHeader({ profile, onEditClick }: ProfileHeaderProps) {
  const currentUser = useAuthStore((state) => state.user);
  const { followMutation, unfollowMutation } = useFollowToggle(profile.username);
  const navigate = useNavigate();
  const { mutate: startConversation, isPending: isStartingChat } = useStartConversation();
  const isOwnProfile = currentUser?.id === profile.id;

  const handleMessageClick = () => {
    startConversation(profile.username, {
      onSuccess: (conversation) => {
        navigate(`/chat?conversation=${conversation.id}`);
      },
    });
  };

  return (
    <div className="border-b border-line pb-8">
      <div className="flex items-start gap-6">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-line">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.username}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-2xl text-ink/40">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl text-ink">{profile.username}</h1>

            {isOwnProfile ? (
              <Button className="w-auto px-4 py-2" onClick={onEditClick}>
                Chỉnh sửa profile
              </Button>
            ) : profile.isFollowing ? (
              <Button
                className="w-auto bg-transparent px-4 py-2 text-ink outline outline-1 outline-line hover:bg-line/30"
                isLoading={unfollowMutation.isPending}
                onClick={() => unfollowMutation.mutate()}
              >
                Đang follow
              </Button>
            ) : (
              <Button
                className="w-auto px-4 py-2"
                isLoading={followMutation.isPending}
                onClick={() => followMutation.mutate()}
              >
                Follow
              </Button>
            )}
          </div>
          {!isOwnProfile && (
            <Button
              className="w-auto bg-transparent px-4 py-2 text-ink outline outline-1 outline-line hover:bg-line/30"
              isLoading={isStartingChat}
              onClick={handleMessageClick}
            >
              Nhắn tin
            </Button>
          )}

          <div className="mt-3 flex gap-5 font-sans text-sm text-ink/60">
            <span>
              <strong className="text-ink">{profile.followersCount}</strong> followers
            </span>
            <span>
              <strong className="text-ink">{profile.followingCount}</strong> following
            </span>
          </div>

          {profile.bio && <p className="mt-3 font-sans text-sm text-ink/70">{profile.bio}</p>}
        </div>
      </div>
    </div>
  );
}
