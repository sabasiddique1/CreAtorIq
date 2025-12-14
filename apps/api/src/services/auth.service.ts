import { UserModel } from "../db/index.js"
import { hashPassword, comparePassword } from "../utils/password.js"
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js"
import type { User, UserRole } from "@engagement-nexus/types"
import { ValidationError, UnauthorizedError } from "../middleware/error-handler.js"

export class AuthService {
  static async register(
    email: string,
    password: string,
    name: string,
    role: UserRole = "SUBSCRIBER_T1",
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Validate inputs
    if (!email || !password || !name) {
      throw new ValidationError("Email, password, and name are required")
    }

    if (password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters")
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      throw new ValidationError("User with this email already exists")
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const newUser = await UserModel.create({
      email,
      passwordHash,
      name,
      role,
    })

    const user = newUser.toObject()
    delete (user as any).passwordHash

    const accessToken = generateAccessToken(user as User)
    const refreshToken = generateRefreshToken(user as User)

    return { user: user as User, accessToken, refreshToken }
  }

  static async login(
    email: string,
    password: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const user = await UserModel.findOne({ email })

    if (!user) {
      throw new UnauthorizedError("Invalid credentials")
    }

    const isPasswordValid = await comparePassword(password, (user as any).passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials")
    }

    const userObj = user.toObject()
    delete (userObj as any).passwordHash

    const accessToken = generateAccessToken(userObj as User)
    const refreshToken = generateRefreshToken(userObj as User)

    return { user: userObj as User, accessToken, refreshToken }
  }

  static async getCurrentUser(userId: string): Promise<User> {
    const user = await UserModel.findById(userId)

    if (!user) {
      throw new UnauthorizedError("User not found")
    }

    const userObj = user.toObject()
    delete (userObj as any).passwordHash

    return userObj as User
  }
}
