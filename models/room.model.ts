import mongoose, { Schema, models, model } from "mongoose"

const RoomSchema = new Schema(
  {
    roomCode: { type: String, required: true, unique: true, index: true },
    hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hostActive: { type: Boolean, default: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    blockedRejoinUsers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    status: {
      type: String,
      enum: ["waiting", "voting-genre", "playing", "completed"],
      default: "waiting",
    },
    genreVotes: {
      type: Map,
      of: [Schema.Types.ObjectId],
      default: new Map(),
    },
    selectedGenre: { type: String, default: null },
    storyId: { type: Schema.Types.ObjectId, ref: "Story", default: null },
    choiceVotes: {
      type: Map,
      of: [Schema.Types.ObjectId],
      default: new Map(),
    },
    currentChoiceIndex: { type: Number, default: 0 },
    isProcessing: { type: Boolean, default: false },
    lastChoiceEvaluation: {
      quality: { type: String, enum: ["excellent", "good", "average", "bad"], default: null },
      message: { type: String, default: null },
    },
    tiedChoicesForVoting: { type: [String], default: [] },
    messages: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        username: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    newHostNotification: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdAt: { type: Date, default: Date.now, expires: 86400 },
  },
  { timestamps: true },
)

const Room = models.Room || model("Room", RoomSchema)

export default Room

