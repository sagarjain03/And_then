import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/db/dbconfig"
import User from "@/models/user.model"
import { getDataFromToken } from "@/helpers/getDataFromToken"

export async function GET(request: NextRequest) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(userId).select("_id username email")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    })
  } catch (error: any) {
    console.error("Profile error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}