import dbConnect from "@/src/lib/dbConnect";
import User from "@/src/model/User.model";
import { Message } from "@/src/model/User.model";

export async function POST(request: Request) {
  await dbConnect();

  const { username, content } = await request.json();
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const isAcceptingMessage = user.isAcceptingMessage;

    if (!isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User not Accepting Message",
        },
        { status: 403 }
      );
    }

    const newMessage = { content, createdAt: new Date() };

    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error while sending Message : ", error);
    return Response.json(
      {
        success: false,
        message: "Error while sending message",
      },
      { status: 500 }
    );
  }
}
