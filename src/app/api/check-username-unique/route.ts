import dbConnect from "@/src/lib/dbConnect";
import User from "@/src/model/User.model";
import z, { flattenError } from "zod";
import { usernameValidation } from "@/src/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };

    const result = UsernameQuerySchema.safeParse(queryParam);
    console.log(result);

    if (!result.success) {
      const flattened = flattenError(result.error);
      const usernameErrors = flattened.fieldErrors?.username || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const doesUserExist = await User.findOne({ username, isVerified: true });

    if (doesUserExist) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: true,
          message: "Username is available",
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Error while Checking username : ", error);
    return Response.json(
      {
        success: false,
        message: "Error while checking username",
      },
      { status: 500 }
    );
  }
}
