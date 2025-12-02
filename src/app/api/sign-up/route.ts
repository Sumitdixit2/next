import dbConnect from "@/src/lib/dbConnect";
import User from "@/src/model/User.model";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "@/src/utils/sendVerificationEmail";
import { NextRequest } from "next/server";
import { success } from "zod";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();
    const existingUserVerifiedByUsername = await User.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        { success: false, message: "This Username has been taken" },
        { status: 400 }
      );
    }

    const existingUserVerifiedByEmail = await User.findOne({ email });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(verifyCode);
    console.log(typeof verifyCode);

    if (existingUserVerifiedByEmail) {
      if (existingUserVerifiedByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserVerifiedByEmail.password = hashedPassword;
        existingUserVerifiedByEmail.verifyCode = verifyCode;
        existingUserVerifiedByEmail.verifyCodeExpiry = new Date(
          Date.now() + 3600000
        );

        await existingUserVerifiedByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        verifyCode: verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();
    }

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: emailResponse.message,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log("Error while registering user", error.message);
    return Response.json(
      {
        success: false,
        meessage: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
