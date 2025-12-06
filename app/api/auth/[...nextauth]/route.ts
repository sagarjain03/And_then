import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectDB } from "@/db/dbconfig"
import User from "@/models/user.model"
import bcryptjs from "bcryptjs"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          await connectDB()
          const user = await User.findOne({ email: credentials.email })

          if (!user) return null

          const isMatch = await bcryptjs.compare(
            credentials.password,
            user.password
          )
          if (!isMatch) return null

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      if (account && profile) {
        // Google sign-in
        token.id = user?.id || (profile as any).sub
        token.email = (profile as any).email
        token.name = (profile as any).name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).email = token.email
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile) {
        // Optional: Auto-create user in DB on Google sign-in
        try {
          await connectDB()
          const existingUser = await User.findOne({
            email: (profile as any).email,
          })
          if (!existingUser) {
            await User.create({
              username: (profile as any).name || (profile as any).email,
              email: (profile as any).email,
              password: "oauth-user", // Placeholder for OAuth users
            })
          }
        } catch (error) {
          console.error("Error creating user on Google sign-in:", error)
        }
      }
      return true
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }