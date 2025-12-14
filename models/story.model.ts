import mongoose, { Schema, models, model } from "mongoose"

const StorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    genre: { type: String, required: true },
    content: { type: String, required: true },
    choices: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
    currentChoiceIndex: { type: Number, default: 0 },
    personalityTraits: { type: Map, of: Number },
    character: {
      name: String,
      archetype: String,
      role: String,
      description: String,
      strengths: [String],
      weaknesses: [String],
      preferredGenres: [String],
    },
    isStoryComplete: { type: Boolean, default: false },
    choiceHistory: [
      {
        segmentIndex: Number,
        choiceId: String,
        quality: String,
      },
    ],
    // Full story content with all chapters and choices
    fullStoryContent: [
      {
        chapterIndex: Number,
        content: String,
        choices: [
          {
            id: String,
            text: String,
          },
        ],
        selectedChoice: {
          id: String,
          text: String,
        },
      },
    ],
    isMultiplayer: { type: Boolean, default: false },
    // Room association enables dashboards to surface a Rejoin link
    roomCode: { type: String, default: null },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

const Story = models.Story || model("Story", StorySchema)

export default Story
