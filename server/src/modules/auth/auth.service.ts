import bcrypt from "bcrypt";
import { Types } from "mongoose";
import { User } from "../user/user.model";
import { RegisterInput, LoginInput } from "./auth.validation";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  createTokenFamily,
  createTokenId,
} from "../../utils/generateTokens";
import { saveTokenFamily, getTokenFamily, revokeTokenFamily } from "./refreshToken.store";

const SALT_ROUNDS = 10;

export class TokenTheftError extends Error {}

const issueTokenPair = async (userId: Types.ObjectId) => {
  const familyId = createTokenFamily();
  const jti = createTokenId();

  await saveTokenFamily(familyId, userId.toString(), jti);

  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId, familyId, jti);

  return { accessToken, refreshToken };
};

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await User.findOne({
    $or: [{ email: input.email }, { username: input.username }],
  });

  if (existingUser) {
    if (existingUser.email === input.email) {
      throw new Error("Email đã được sử dụng");
    }
    throw new Error("Username đã được sử dụng");
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const newUser = await User.create({
    username: input.username,
    email: input.email,
    password: hashedPassword,
  });

  const { accessToken, refreshToken } = await issueTokenPair(newUser._id);

  return {
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
    },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email }).select("+password");

  if (!user) {
    throw new Error("Email hoặc password không đúng");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new Error("Email hoặc password không đúng");
  }

  const { accessToken, refreshToken } = await issueTokenPair(user._id);

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
};

export const rotateRefreshToken = async (oldRefreshToken: string) => {
  let decoded;

  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch (error) {
    throw new Error("Refresh token không hợp lệ hoặc đã hết hạn", { cause: error });
  }

  const { userId, familyId, jti } = decoded;
  const stored = await getTokenFamily(familyId);

  if (!stored) {
    throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
  }

  if (stored.jti !== jti) {
    // Token này đã bị thay thế bởi 1 lần refresh trước đó, nhưng vẫn có người dùng lại
    // => dấu hiệu rõ ràng của việc token bị đánh cắp và dùng song song với chủ thật
    await revokeTokenFamily(familyId);
    throw new TokenTheftError(
      "Phát hiện bất thường, phiên đăng nhập đã bị thu hồi. Vui lòng đăng nhập lại"
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    await revokeTokenFamily(familyId);
    throw new Error("Người dùng không tồn tại");
  }

  const newJti = createTokenId();
  await saveTokenFamily(familyId, userId, newJti);

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id, familyId, newJti);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (refreshToken?: string): Promise<void> => {
  if (!refreshToken) return;

  try {
    const decoded = verifyRefreshToken(refreshToken);
    await revokeTokenFamily(decoded.familyId);
  } catch {
    // Token không hợp lệ hoặc đã hết hạn — coi như đã ở trạng thái "logout" rồi, không cần làm gì thêm
  }
};
