export interface PersonalityTrait {
  id: string
  name: string
  description: string
  color: string
}

export const PERSONALITY_TRAITS: PersonalityTrait[] = [
  {
    id: "conscientiousness",
    name: "Conscientiousness",
    description: "Organization, discipline, and attention to detail",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "neuroticism",
    name: "Emotional Stability",
    description: "Resilience, calmness, and emotional balance",
    color: "from-yellow-500 to-amber-500",
  },
  {
    id: "extraversion",
    name: "Extraversion",
    description: "Sociability, assertiveness, and positive emotions",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "agreeableness",
    name: "Agreeableness",
    description: "Compassion, cooperation, and empathy",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "openness",
    name: "Openness",
    description: "Imagination, creativity, and openness to new experiences",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "honesty-humility",
    name: "Honesty-Humility",
    description: "Sincerity, fairness, and modesty",
    color: "from-indigo-500 to-purple-500",
  },
]

export interface QuestionOption {
  label: string
  text: string
  scores: {
    conscientiousness: number
    neuroticism: number
    extraversion: number
    agreeableness: number
    openness: number
    "honesty-humility": number
  }
}

export interface PersonalityQuestion {
  id: number
  text: string
  options: QuestionOption[]
  insight: string
}

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  {
    id: 1,
    text: "You find a co-worker about to make a major mistake that could cost the company a lot, but correcting it may make you look bad. You…",
    options: [
      {
        label: "A",
        text: "Step in and correct them",
        scores: {
          conscientiousness: 20,
          neuroticism: -5,
          extraversion: 5,
          agreeableness: 10,
          openness: 0,
          "honesty-humility": 20,
        },
      },
      {
        label: "B",
        text: "Warn them privately",
        scores: {
          conscientiousness: 15,
          neuroticism: 0,
          extraversion: 0,
          agreeableness: 10,
          openness: 5,
          "honesty-humility": 15,
        },
      },
      {
        label: "C",
        text: "Do nothing, focus on your own work",
        scores: {
          conscientiousness: -5,
          neuroticism: 5,
          extraversion: -5,
          agreeableness: -5,
          openness: 0,
          "honesty-humility": -10,
        },
      },
      {
        label: "D",
        text: "Use it as an opportunity to showcase skills",
        scores: {
          conscientiousness: 10,
          neuroticism: 0,
          extraversion: 10,
          agreeableness: -5,
          openness: 5,
          "honesty-humility": -10,
        },
      },
    ],
    insight: "Measures honesty, conscientiousness, courage, self-interest vs ethics",
  },
  {
    id: 2,
    text: "You accidentally receive extra change from a cashier. You…",
    options: [
      {
        label: "A",
        text: "Return it immediately",
        scores: {
          conscientiousness: 15,
          neuroticism: -5,
          extraversion: 0,
          agreeableness: 10,
          openness: 5,
          "honesty-humility": 20,
        },
      },
      {
        label: "B",
        text: "Keep it but feel guilty",
        scores: {
          conscientiousness: 0,
          neuroticism: 10,
          extraversion: 0,
          agreeableness: 5,
          openness: 0,
          "honesty-humility": -5,
        },
      },
      {
        label: "C",
        text: "Rationalize and spend it",
        scores: {
          conscientiousness: -10,
          neuroticism: 0,
          extraversion: 0,
          agreeableness: -5,
          openness: 5,
          "honesty-humility": -15,
        },
      },
      {
        label: "D",
        text: "Test if the cashier notices",
        scores: {
          conscientiousness: -5,
          neuroticism: 5,
          extraversion: 5,
          agreeableness: -5,
          openness: 10,
          "honesty-humility": -10,
        },
      },
    ],
    insight: "Measures honesty-humility, moral reasoning, self-justification",
  },
  {
    id: 3,
    text: "You are preparing for an important exam and half your notes are destroyed accidentally. You…",
    options: [
      {
        label: "A",
        text: "Calmly salvage what you can and continue",
        scores: {
          conscientiousness: 20,
          neuroticism: -10,
          extraversion: 0,
          agreeableness: 5,
          openness: 5,
          "honesty-humility": 10,
        },
      },
      {
        label: "B",
        text: "Panic but try to make do",
        scores: {
          conscientiousness: 5,
          neuroticism: 10,
          extraversion: 0,
          agreeableness: 0,
          openness: 0,
          "honesty-humility": 5,
        },
      },
      {
        label: "C",
        text: "Blame the person and argue",
        scores: {
          conscientiousness: -5,
          neuroticism: 15,
          extraversion: 5,
          agreeableness: -10,
          openness: 0,
          "honesty-humility": -5,
        },
      },
      {
        label: "D",
        text: "Give up",
        scores: {
          conscientiousness: -20,
          neuroticism: 20,
          extraversion: -5,
          agreeableness: -5,
          openness: -5,
          "honesty-humility": 0,
        },
      },
    ],
    insight: "Measures stress response, emotional stability, problem-solving",
  },
  {
    id: 4,
    text: "At a party, someone you dislike approaches and wants to join your group. You…",
    options: [
      {
        label: "A",
        text: "Politely include them",
        scores: {
          conscientiousness: 5,
          neuroticism: -5,
          extraversion: 10,
          agreeableness: 20,
          openness: 5,
          "honesty-humility": 10,
        },
      },
      {
        label: "B",
        text: "Try to avoid but stay civil",
        scores: {
          conscientiousness: 0,
          neuroticism: 5,
          extraversion: -5,
          agreeableness: 10,
          openness: 0,
          "honesty-humility": 5,
        },
      },
      {
        label: "C",
        text: "Exclude them clearly",
        scores: {
          conscientiousness: 5,
          neuroticism: 0,
          extraversion: -10,
          agreeableness: -10,
          openness: 0,
          "honesty-humility": -5,
        },
      },
      {
        label: "D",
        text: "Make a joke at their expense",
        scores: {
          conscientiousness: -5,
          neuroticism: 0,
          extraversion: 15,
          agreeableness: -15,
          openness: 5,
          "honesty-humility": -10,
        },
      },
    ],
    insight: "Measures agreeableness, extraversion, assertiveness",
  },
  {
    id: 5,
    text: "You are offered a highly uncertain investment opportunity that could be life-changing. You…",
    options: [
      {
        label: "A",
        text: "Invest immediately without hesitation",
        scores: {
          conscientiousness: 10,
          neuroticism: -5,
          extraversion: 5,
          agreeableness: 0,
          openness: 20,
          "honesty-humility": 5,
        },
      },
      {
        label: "B",
        text: "Research carefully before deciding",
        scores: {
          conscientiousness: 15,
          neuroticism: -5,
          extraversion: 0,
          agreeableness: 5,
          openness: 15,
          "honesty-humility": 10,
        },
      },
      {
        label: "C",
        text: "Avoid because it's too risky",
        scores: {
          conscientiousness: 5,
          neuroticism: 10,
          extraversion: -5,
          agreeableness: 0,
          openness: -10,
          "honesty-humility": 5,
        },
      },
      {
        label: "D",
        text: "Mock the idea and discourage others",
        scores: {
          conscientiousness: -5,
          neuroticism: 0,
          extraversion: 10,
          agreeableness: -10,
          openness: -5,
          "honesty-humility": -10,
        },
      },
    ],
    insight: "Measures openness, risk-taking, prudence",
  },
  {
    id: 6,
    text: "A close friend confides that they committed a crime and begs you not to tell. You…",
    options: [
      {
        label: "A",
        text: "Convince them to confess",
        scores: {
          conscientiousness: 15,
          neuroticism: 0,
          extraversion: 0,
          agreeableness: 10,
          openness: 5,
          "honesty-humility": 20,
        },
      },
      {
        label: "B",
        text: "Keep their secret but try to prevent future wrongdoing",
        scores: {
          conscientiousness: 10,
          neuroticism: 5,
          extraversion: 0,
          agreeableness: 15,
          openness: 5,
          "honesty-humility": 15,
        },
      },
      {
        label: "C",
        text: "Stay silent regardless",
        scores: {
          conscientiousness: 0,
          neuroticism: 5,
          extraversion: 0,
          agreeableness: 5,
          openness: 0,
          "honesty-humility": -5,
        },
      },
      {
        label: "D",
        text: "Distance yourself from them",
        scores: {
          conscientiousness: 0,
          neuroticism: -5,
          extraversion: -5,
          agreeableness: -10,
          openness: 0,
          "honesty-humility": 0,
        },
      },
    ],
    insight: "Measures loyalty, honesty-humility, moral reasoning",
  },
  {
    id: 7,
    text: "You realize your behavior hurt someone close to you, but admitting it could make you appear weak. You…",
    options: [
      {
        label: "A",
        text: "Admit and apologize sincerely",
        scores: {
          conscientiousness: 15,
          neuroticism: -5,
          extraversion: 0,
          agreeableness: 20,
          openness: 5,
          "honesty-humility": 20,
        },
      },
      {
        label: "B",
        text: "Apologize but justify your actions",
        scores: {
          conscientiousness: 10,
          neuroticism: 0,
          extraversion: 0,
          agreeableness: 10,
          openness: 5,
          "honesty-humility": 10,
        },
      },
      {
        label: "C",
        text: "Ignore and hope they forget",
        scores: {
          conscientiousness: -5,
          neuroticism: 10,
          extraversion: 0,
          agreeableness: -5,
          openness: 0,
          "honesty-humility": -5,
        },
      },
      {
        label: "D",
        text: "Blame circumstances or them",
        scores: {
          conscientiousness: -10,
          neuroticism: 5,
          extraversion: 0,
          agreeableness: -10,
          openness: 0,
          "honesty-humility": -10,
        },
      },
    ],
    insight: "Measures empathy, humility, conscientiousness, emotional intelligence",
  },
  {
    id: 8,
    text: "A stranger needs urgent help at night in an unsafe area. You…",
    options: [
      {
        label: "A",
        text: "Help immediately, risking yourself",
        scores: {
          conscientiousness: 15,
          neuroticism: -5,
          extraversion: 5,
          agreeableness: 20,
          openness: 5,
          "honesty-humility": 20,
        },
      },
      {
        label: "B",
        text: "Call authorities and guide from a safe distance",
        scores: {
          conscientiousness: 10,
          neuroticism: 0,
          extraversion: 0,
          agreeableness: 15,
          openness: 5,
          "honesty-humility": 15,
        },
      },
      {
        label: "C",
        text: "Ignore, prioritize safety",
        scores: {
          conscientiousness: 0,
          neuroticism: 5,
          extraversion: -5,
          agreeableness: 0,
          openness: 0,
          "honesty-humility": 0,
        },
      },
      {
        label: "D",
        text: "Use situation to lecture others",
        scores: {
          conscientiousness: 5,
          neuroticism: 0,
          extraversion: 5,
          agreeableness: -5,
          openness: 10,
          "honesty-humility": -5,
        },
      },
    ],
    insight: "Measures altruism, risk-taking, pragmatism, moral reasoning",
  },
  {
    id: 9,
    text: "Half your project resources fail suddenly. You…",
    options: [
      {
        label: "A",
        text: "Find creative ways to achieve goals",
        scores: {
          conscientiousness: 20,
          neuroticism: -5,
          extraversion: 5,
          agreeableness: 5,
          openness: 15,
          "honesty-humility": 10,
        },
      },
      {
        label: "B",
        text: "Redistribute work and ask for extensions",
        scores: {
          conscientiousness: 15,
          neuroticism: 0,
          extraversion: 0,
          agreeableness: 10,
          openness: 5,
          "honesty-humility": 10,
        },
      },
      {
        label: "C",
        text: "Panic and hope things resolve themselves",
        scores: {
          conscientiousness: -5,
          neuroticism: 15,
          extraversion: -5,
          agreeableness: -5,
          openness: 0,
          "honesty-humility": -5,
        },
      },
      {
        label: "D",
        text: "Blame team and focus on personal goals",
        scores: {
          conscientiousness: -10,
          neuroticism: 5,
          extraversion: 0,
          agreeableness: -10,
          openness: 0,
          "honesty-humility": -10,
        },
      },
    ],
    insight: "Measures conscientiousness, problem-solving, emotional stability, leadership",
  },
  {
    id: 10,
    text: "You discover confidential information that could benefit you financially if used. You…",
    options: [
      {
        label: "A",
        text: "Report it immediately",
        scores: {
          conscientiousness: 15,
          neuroticism: -5,
          extraversion: 0,
          agreeableness: 10,
          openness: 5,
          "honesty-humility": 20,
        },
      },
      {
        label: "B",
        text: "Use it but feel guilty",
        scores: {
          conscientiousness: 0,
          neuroticism: 5,
          extraversion: 0,
          agreeableness: 0,
          openness: 5,
          "honesty-humility": -10,
        },
      },
      {
        label: "C",
        text: "Ignore it",
        scores: {
          conscientiousness: 5,
          neuroticism: 0,
          extraversion: 0,
          agreeableness: 5,
          openness: 0,
          "honesty-humility": 10,
        },
      },
      {
        label: "D",
        text: "Exploit it and justify actions",
        scores: {
          conscientiousness: -5,
          neuroticism: 0,
          extraversion: 5,
          agreeableness: -5,
          openness: 5,
          "honesty-humility": -15,
        },
      },
    ],
    insight: "Measures honesty-humility, risk, moral reasoning",
  },
  {
    id: 11,
    text: "You are at a team dinner; one member is quietly being excluded. You…",
    options: [
      {
        label: "A",
        text: "Invite them personally",
        scores: {
          conscientiousness: 10,
          neuroticism: -5,
          extraversion: 5,
          agreeableness: 20,
          openness: 5,
          "honesty-humility": 15,
        },
      },
      {
        label: "B",
        text: "Talk to group subtly to include them",
        scores: {
          conscientiousness: 10,
          neuroticism: 0,
          extraversion: 5,
          agreeableness: 15,
          openness: 5,
          "honesty-humility": 10,
        },
      },
      {
        label: "C",
        text: "Do nothing",
        scores: {
          conscientiousness: 0,
          neuroticism: 5,
          extraversion: 0,
          agreeableness: 0,
          openness: 0,
          "honesty-humility": 0,
        },
      },
      {
        label: "D",
        text: "Joke at their expense",
        scores: {
          conscientiousness: -5,
          neuroticism: 0,
          extraversion: 10,
          agreeableness: -10,
          openness: 5,
          "honesty-humility": -10,
        },
      },
    ],
    insight: "Measures agreeableness, extraversion, social empathy",
  },
  {
    id: 12,
    text: "Your boss asks you to perform a task you think is unethical but could benefit your career. You…",
    options: [
      {
        label: "A",
        text: "Refuse politely",
        scores: {
          conscientiousness: 15,
          neuroticism: 0,
          extraversion: 0,
          agreeableness: 5,
          openness: 5,
          "honesty-humility": 20,
        },
      },
      {
        label: "B",
        text: "Follow instructions to gain advantage",
        scores: {
          conscientiousness: 5,
          neuroticism: -5,
          extraversion: 5,
          agreeableness: -5,
          openness: 5,
          "honesty-humility": -10,
        },
      },
      {
        label: "C",
        text: "Report to higher authority",
        scores: {
          conscientiousness: 10,
          neuroticism: 0,
          extraversion: 0,
          agreeableness: 10,
          openness: 5,
          "honesty-humility": 20,
        },
      },
      {
        label: "D",
        text: "Pretend compliance but avoid consequences",
        scores: {
          conscientiousness: 5,
          neuroticism: 5,
          extraversion: 0,
          agreeableness: 0,
          openness: 10,
          "honesty-humility": -5,
        },
      },
    ],
    insight: "Measures integrity, career ambition vs ethics, courage",
  },
]

export interface PersonalityScores {
  [key: string]: number
}

export interface CharacterProfile {
  name: string
  archetype: string
  role: string
  description: string
  strengths: string[]
  weaknesses: string[]
  preferredGenres: string[]
}

export interface PersonalityResult {
  scores: PersonalityScores
  topTraits: string[]
  summary: string
  character?: CharacterProfile
}

export function calculatePersonalityScores(responses: Record<number, string>): PersonalityResult {
  const scores: PersonalityScores = {
    conscientiousness: 0,
    neuroticism: 0,
    extraversion: 0,
    agreeableness: 0,
    openness: 0,
    "honesty-humility": 0,
  }

  // Calculate scores based on responses
  PERSONALITY_QUESTIONS.forEach((question) => {
    const selectedOption = responses[question.id]
    if (selectedOption) {
      const option = question.options.find((opt) => opt.label === selectedOption)
      if (option) {
        // Add scores from the selected option
        Object.entries(option.scores).forEach(([trait, score]) => {
          scores[trait] = (scores[trait] || 0) + score
        })
      }
    }
  })

  // Normalize scores to 0-100 range
  // The raw scores can range from approximately -150 to +300 per trait
  // We'll normalize to 0-100 where 50 is neutral
  const normalizedScores: PersonalityScores = {}
  Object.entries(scores).forEach(([trait, score]) => {
    // Map from [-150, 300] to [0, 100]
    // Neutral (0) maps to 50
    const normalized = Math.max(0, Math.min(100, 50 + score / 6))
    normalizedScores[trait] = Math.round(normalized)
  })

  // Get top 3 traits
  const topTraits = Object.entries(normalizedScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([trait]) => trait)

  // Generate summary
  const summary = generatePersonalitySummary(normalizedScores, topTraits)

  return {
    scores: normalizedScores,
    topTraits,
    summary,
  }
}

function generatePersonalitySummary(scores: PersonalityScores, topTraits: string[]): string {
  const traitNames = topTraits.map((id) => PERSONALITY_TRAITS.find((t) => t.id === id)?.name).filter(Boolean)

  // Generate dynamic summary based on top traits
  const summaryTemplates: Record<string, string> = {
    conscientiousness:
      "You are highly organized and disciplined, approaching challenges with careful planning and attention to detail.",
    neuroticism:
      "You maintain emotional balance and resilience, staying calm under pressure and adapting well to stress.",
    extraversion:
      "You thrive in social settings, drawing energy from interactions and naturally taking on leadership roles.",
    agreeableness:
      "You value harmony and cooperation, showing empathy and compassion in your relationships with others.",
    openness: "You embrace new experiences and ideas, approaching life with curiosity and creative thinking.",
    "honesty-humility":
      "You prioritize integrity and fairness, making ethical decisions even when they come at personal cost.",
  }

  const primaryTrait = topTraits[0]
  const baseDescription = summaryTemplates[primaryTrait] || "You have a unique and balanced personality."

  return `${baseDescription} Your combination of ${traitNames.join(", ")} makes you well-suited for stories that challenge your values and decision-making abilities.`
}
