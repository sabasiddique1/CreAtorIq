import { CreatorProfileModel, SubscriberProfileModel } from "../db/index.js"
import { ForbiddenError, NotFoundError } from "../middleware/error-handler.js"

export class RbacService {
  /**
   * Check if user is the creator owner
   */
  static async isCreatorOwner(userId: string, creatorId: string): Promise<boolean> {
    const creator = await CreatorProfileModel.findById(creatorId)
    if (!creator) {
      throw new NotFoundError("Creator not found")
    }
    return (creator as any).userId.toString() === userId
  }

  /**
   * Check if user is subscriber of creator
   */
  static async isSubscriber(userId: string, creatorId: string): Promise<boolean> {
    const subscriber = await SubscriberProfileModel.findOne({
      userId,
      creatorId,
    })
    return !!subscriber
  }

  /**
   * Get subscriber tier
   */
  static async getSubscriberTier(userId: string, creatorId: string): Promise<"T1" | "T2" | "T3" | null> {
    const subscriber = await SubscriberProfileModel.findOne({
      userId,
      creatorId,
    })
    return (subscriber as any)?.tier || null
  }

  /**
   * Require creator ownership
   */
  static async requireCreatorOwner(userId: string, creatorId: string): Promise<void> {
    const isOwner = await this.isCreatorOwner(userId, creatorId)
    if (!isOwner) {
      throw new ForbiddenError("Only creator can access this resource")
    }
  }

  /**
   * Require creator or admin access
   */
  static async requireCreatorOrAdmin(userId: string, userRole: string, creatorId: string): Promise<void> {
    if (userRole === "ADMIN") {
      return
    }

    const isOwner = await this.isCreatorOwner(userId, creatorId)
    if (!isOwner) {
      throw new ForbiddenError("Access denied")
    }
  }
}
