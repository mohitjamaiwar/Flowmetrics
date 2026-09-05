import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { signToken } from "../utils/jwt";
import { LoginInput } from "../validators/authValidators";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  // Look up by email. We intentionally return the SAME generic error
  // whether the user doesn't exist or the password is wrong, so we
  // never leak which one it was to a potential attacker.
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ id: user.id, role: user.role });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});
