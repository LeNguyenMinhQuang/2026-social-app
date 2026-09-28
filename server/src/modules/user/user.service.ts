import { Types } from "mongoose";
import { User } from "./user.model";
import { UpdateProfileInput } from "./user.validation";
import { uploadImageBuffer } from "../../utils/uploadToCloudinary";
import { createNotification } from "../notification/notification.service";

export const getProfileByUsername = async (username: string, viewerId?: Types.ObjectId) => {
  const user = await User.findOne({ username });

  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  return {
    id: user._id,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    followersCount: user.followers.length,
    followingCount: user.following.length,
    isFollowing: viewerId ? user.followers.some((f) => f.equals(viewerId)) : false,
    isMe: viewerId ? user._id.equals(viewerId) : false,
  };
};

export const updateProfile = async (userId: Types.ObjectId, input: UpdateProfileInput) => {
  if (input.username) {
    const existing = await User.findOne({ username: input.username, _id: { $ne: userId } });
    if (existing) {
      throw new Error("Username đã được sử dụng");
    }
  }

  const user = await User.findByIdAndUpdate(userId, input, { returnDocument: "after" });

  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
  };
};

export const updateAvatar = async (userId: Types.ObjectId, buffer: Buffer) => {
  const result = await uploadImageBuffer(buffer, "avatars");

  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: result.secure_url },
    { returnDocument: "after" }
  );

  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  return { avatar: user.avatar };
};

export const followUser = async (currentUserId: Types.ObjectId, targetUsername: string) => {
  const targetUser = await User.findOne({ username: targetUsername });

  if (!targetUser) {
    throw new Error("Không tìm thấy người dùng");
  }

  if (targetUser._id.equals(currentUserId)) {
    throw new Error("Không thể tự follow chính mình");
  }

  const alreadyFollowing = targetUser.followers.some((f) => f.equals(currentUserId));

  if (alreadyFollowing) {
    throw new Error("Bạn đã follow người này rồi");
  }

  await User.findByIdAndUpdate(targetUser._id, { $addToSet: { followers: currentUserId } });
  await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUser._id } });

  await createNotification({
    recipientId: targetUser._id,
    senderId: currentUserId,
    type: "follow",
  });

  return { isFollowing: true };
};

export const unfollowUser = async (currentUserId: Types.ObjectId, targetUsername: string) => {
  const targetUser = await User.findOne({ username: targetUsername });

  if (!targetUser) {
    throw new Error("Không tìm thấy người dùng");
  }

  await User.findByIdAndUpdate(targetUser._id, { $pull: { followers: currentUserId } });
  await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUser._id } });

  return { isFollowing: false };
};
