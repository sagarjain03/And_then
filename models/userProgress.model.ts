import mongoose, { Schema, models, model } from "mongoose"

const UserProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    storiesCompleted: { type: Number, default: 0 },
    choicesMade: { type: Number, default: 0 },
    badges: [
      {
        id: String,
        name: String,
        description: String,
        icon: String,
        unlockedAt: Date,
      },
    ],
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

const UserProgress = models.UserProgress || model("UserProgress", UserProgressSchema)

export default UserProgress
