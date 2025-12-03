import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import User from "@/src/model/User.model";
import { User as Usern } from "next-auth";
import mongoose from "mongoose";
import { success } from "zod";

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
    const userId = new mongoose.Types.ObjectId(user._id);

    const users = await User.aggregate([
      { $match: { id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!users || users.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User not Found",
        },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: true,
        message: users[0].messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while fetching status");
    return Response.json({
      success: false,
      message: "Failed to get messages",
    });
  }
}
