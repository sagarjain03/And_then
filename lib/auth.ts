import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface JWTPayload {
  userId: string
  email: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Compare password with hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Create JWT token
export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

// Extract token from request
export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }
  return authHeader.slice(7)
}
