import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"

export default async function DashboardIndexRedirect() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const userId = (session.user as any)?.id ?? (session.user as any)?.email

  if (!userId) {
    redirect("/auth/login")
  }

  redirect(`/dashboard/${userId}`)
}
