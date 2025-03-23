import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { environments } from "../config/environments";
import { IUser } from "../interfaces/user.interface";

const { JWT_SECRET } = environments;

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
