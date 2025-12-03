import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import User from "@/src/model/User.model";
import { User as Usern } from "next-auth";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    const user: Usern = session?.user as Usern;

    if (!session || !user) {
      return Response.json(
        {
          success: false,
          message: "Not Authenticated",
        },
        { status: 401 }
      );
    }

    const userId = user._id;
    const { acceptMessages } = await request.json();

    const update = { isAcceptingMessage: acceptMessages };

    const updatedUser = await User.findByIdAndUpdate(userId, update, {
      new: true,
    });

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "failed to fetch user and update it's value",
        },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated successfully",
        updatedUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Error while updating user status to accept messages : ",
      error
    );

    return Response.json(
      {
        success: false,
        message: "failed to update user status to accept messages",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    const user: Usern = session?.user as Usern;

    if (!session || !user) {
      return Response.json(
        {
          success: false,
          message: "Not Authenticated",
        },
        { status: 401 }
      );
    }

    const userId = user._id;

    const foundUser = await User.findById(userId);

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        isAcceptingMessage: foundUser.isAcceptingMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Error while updating user status to accept messages : ",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Error while getting message acceptance status",
      },
      { status: 500 }
    );
  }
}
