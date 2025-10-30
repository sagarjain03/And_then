import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { DecodedToken } from "@/types/decodedToken";

export const getDataFromToken = (req: NextRequest): string | null => {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return null;
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    return decodedData.id;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};