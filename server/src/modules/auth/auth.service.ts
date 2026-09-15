import bcrypt from "bcrypt";
import { User } from "../user/user.model";
import { RegisterInput, LoginInput } from "./auth.validation";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/generateTokens";
import { Types } from "mongoose";

const SALT_ROUNDS = 10;

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

  const accessToken = generateAccessToken(newUser._id);
  const refreshToken = generateRefreshToken(newUser._id);

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

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

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

export const refreshAccessToken = async (refreshToken: string) => {
  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new Error("Refresh token không hợp lệ hoặc đã hết hạn", { cause: error });
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  const newAccessToken = generateAccessToken(new Types.ObjectId(user._id));

  return { accessToken: newAccessToken };
};
