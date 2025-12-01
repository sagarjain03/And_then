import { NextRequest, NextResponse } from "next/server"
import { getDataFromToken } from "@/helpers/getDataFromToken"
import { connectDB } from "@/db/dbconfig"
import Story from "@/models/story.model"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getDataFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const result = await Story.deleteOne({ _id: params.id, userId })
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Story deleted" }, { status: 200 })
  } catch (error: any) {
    console.error("Delete story error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
