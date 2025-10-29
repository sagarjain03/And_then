import { type NextRequest, NextResponse } from "next/server"

// TODO: Replace with actual database integration
// This is a placeholder implementation using in-memory storage
const users: Map<string, { email: string; password: string; createdAt: Date }> = new Map()

export async function POST(request: NextRequest) {
  try {
    const { email, password, confirmPassword } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Check if user exists
    if (users.has(email)) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Create user (in production, hash password and store in database)
    users.set(email, {
      email,
      password, // In production, this should be hashed
      createdAt: new Date(),
    })

    return NextResponse.json(
      {
        message: "User created successfully",
        user: { email },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
