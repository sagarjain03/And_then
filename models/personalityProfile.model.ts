import mongoose, { Schema, models, model } from "mongoose"

const PersonalityProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    scores: { type: Map, of: Number, required: true },
    topTraits: { type: [String], required: true },
    summary: { type: String, required: true },
    character: {
      name: String,
      // Explicit anime title so results clearly show which series the character is from
      anime: String,
      archetype: String,
      role: String,
      description: String,
      strengths: [String],
      weaknesses: [String],
      preferredGenres: [String],
    },
  },
  { timestamps: true },
)

const PersonalityProfile = models.PersonalityProfile || model("PersonalityProfile", PersonalityProfileSchema)

export default PersonalityProfile
