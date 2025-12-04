import dbConnect from "@/src/lib/dbConnect";
import User from "@/src/model/User.model";
import { verifySchema } from "@/src/schemas/verifySchema";
import z, { flattenError, success } from "zod";

// const verifyCodeQuerySchema = z.object({
//   verifyCode: verifySchema,
// });

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, verifyCode } = await request.json();
    // const result = verifyCodeQuerySchema.safeParse(verifyCode);

    // if (!result.success) {
    //   const flattened = flattenError(result.error);
    //   const CodeErrors = flattened.fieldErrors?.verifyCode || [];
    //   return Response.json(
    //     {
    //       success: false,
    //       message:
    //         CodeErrors?.length > 0
    //           ? CodeErrors.join(", ")
    //           : "Invalid query parameters",
    //     },
    //     { status: 400 }
    //   );
    // }

    const Usern = await User.findOne({ username });

    if (!Usern) {
      return Response.json(
        {
          success: false,
          message: "User not Found",
        },
        { status: 401 }
      );
    }

    const isCodeCorrect = Usern.verifyCode === verifyCode;
    const isCodeNotExpired = new Date(Usern.verifyCodeExpiry) > new Date();

    if (!isCodeCorrect) {
      return Response.json(
        {
          success: false,
          message: "Invalid Code",
        },
        { status: 400 }
      );
    }

    if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Code is expired",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User verified Successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error while verifying code : ", error);
    return Response.json(
      {
        success: false,
        message: "Error while verifying code",
      },
      { status: 500 }
    );
  }
}
