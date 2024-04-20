require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import userModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { Jwt } from "jsonwebtoken";

//register a user
interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar: string;
}

export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email Already Exists", 400));
      }

      const user: IRegistrationBody = {
        name,
        email,
        password,
        avatar: "",
      };

      const activationToken = createActivationToken(user);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
interface IActivationToken {
  token: string;
  activationCode: string;
}
export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = Jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET,
    {
      expiresIn: "5m",
    }
  );

  return { token, activationCode };
};
