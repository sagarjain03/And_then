import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import type { DecodedToken } from "@/types/decodedToken"

export default async function DashboardIndexRedirect() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  let userId: string | null = null
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken
    userId = decoded.id
  } catch {
    // Invalid token, send user to login
    redirect("/auth/login")
  }

  if (!userId) {
    redirect("/auth/login")
  }

  redirect(`/dashboard/${userId}`)
}
