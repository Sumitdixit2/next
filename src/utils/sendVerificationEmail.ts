import { Resend } from "resend";
import { VerificationEmail } from "@/emails/VerificationEmail";
import { ApiResponse } from "../types/ApiResponse";

const ResendKey = process.env.RESEND_API_KEY;
const resend = new Resend(ResendKey);

export const sendVerificationEmail = async (
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> => {
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "hello world",
      react: VerificationEmail({ username, otp: verifyCode }),
    });

    return { success: true, message: "Verification email sent successfully" };
  } catch (error) {
    console.error("Error sending verification email", error);
    return { success: false, message: "Failed to send verification email" };
  }
};
