import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import User from "@/src/model/User.model";
import { User as Usern } from "next-auth";

export async function DELETE(request: Request , {params} : {params: {messageid:string}}) {
  const messageid = params.messageid;
  await dbConnect();
  const session = await getServerSession(authOptions)
  const user: Usern = session?.user as Usern;

  if(!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated"
      },
      {status: 401}
    )
  }

  try {
   const updatedResult = await User.updateOne(
     {_id: user._id}
     {$pull: {messages:{_id: messageid}}}
   ) 

   if(updatedResult.modifiedCount == 0) {
     return Response.json(
       {success: false,
       message:"message not found or already deleted"},
       {status: 404}
     )
   }

   return Response.json(
     {success: true,
     message: "message deleted"},
     {status: 200}
   )
  } catch (error:any) {
    console.log("error while deleting message: ", error)
    return Response.json(
     {success: true,
     message: "error while deleting message"},
     {status: 200}
   )
  }

  
}
