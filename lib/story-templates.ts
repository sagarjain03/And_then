export interface StoryTemplate {
  opening: string
  choices: Array<{
    text: string
    nextSegment: string
  }>
}

export const STORY_TEMPLATES: Record<string, StoryTemplate[]> = {
  fantasy: [
    {
      opening: `The ancient forest whispers secrets as you step through the mist-shrouded trees. Your hand rests on the hilt of your sword, a family heirloom passed down through generations. Ahead, the path splits into three directions: one leads deeper into the shadowy woods where strange lights flicker, another climbs toward a mountain peak where an old tower stands, and the third descends into a valley where smoke rises from what might be a village.

A raven caws overhead, circling three times before landing on a nearby branch. Its eyes seem almost intelligent as it watches you. In the distance, you hear the faint sound of bells—or is it laughter?`,
      choices: [
        {
          text: "Follow the strange lights deeper into the forest",
          nextSegment: `You venture deeper into the shadowy woods, following the dancing lights. They lead you to a clearing where ancient standing stones form a perfect circle. In the center, a pool of crystal-clear water reflects not the sky above, but a starfield you've never seen before. As you approach, a figure emerges from behind one of the stones—an elf with silver hair and eyes like moonlight. "You've found the Gateway," they say softly. "Few mortals ever do. The question is: are you brave enough to step through?"`,
        },
        {
          text: "Climb toward the mysterious tower on the mountain",
          nextSegment: `The climb is treacherous, but your determination drives you forward. As you near the tower, you notice it's not abandoned as you thought—smoke rises from a chimney, and warm light glows in the windows. The door opens before you can knock, revealing an elderly wizard with a knowing smile. "I've been expecting you," he says, gesturing inside. "The prophecy spoke of one who would climb the mountain when the stars aligned. Come, we have much to discuss about your destiny."`,
        },
        {
          text: "Descend into the valley toward the village",
          nextSegment: `You make your way down into the valley, and as you approach, you realize the village is celebrating some kind of festival. Colorful banners flutter in the breeze, and the sound of music fills the air. But something feels off—the villagers' smiles seem forced, their laughter hollow. An old woman grabs your arm as you enter. "Please," she whispers urgently, "you must help us. The Dragon Lord demands tribute tonight, and we have nothing left to give. You're an outsider—perhaps you can break the curse that binds us."`,
        },
      ],
    },
    {
      opening: `The dragon's roar echoes across the valley as you stand at the entrance to its lair. Your quest has led you here, to the heart of the Crimson Mountains, where the legendary beast guards a treasure beyond imagination. But you're not here for gold—you seek the Dragon's Eye, a magical gem that can save your dying homeland.

Inside the cave, the air grows hot and sulfurous. Gold coins crunch beneath your feet, and the walls are scorched black from centuries of dragon fire. Ahead, you see three passages: one glows with an eerie red light, another is pitch black and silent, and the third echoes with the sound of running water.`,
      choices: [
        {
          text: "Take the passage with the red glow",
          nextSegment: `The red glow intensifies as you proceed, and you soon discover its source—a river of molten lava flowing through a massive chamber. On the far side, perched on a pedestal of obsidian, you see the Dragon's Eye glowing with inner fire. But between you and your goal lies the dragon itself, coiled around the pedestal, its scales shimmering like rubies. Its eye opens, fixing you with an ancient, intelligent gaze. "So," it rumbles, "another hero comes seeking what is mine. Tell me, mortal, why should I not incinerate you where you stand?"`,
        },
        {
          text: "Enter the pitch-black passage",
          nextSegment: `You light a torch and venture into the darkness. The passage twists and turns, leading you deeper into the mountain. Suddenly, your torch illuminates something unexpected—a vast library carved into the stone, filled with ancient tomes and scrolls. At a desk sits a figure in robes, writing by candlelight. They look up, revealing the face of a young woman with dragon-like features—scales along her cheekbones, golden eyes with slitted pupils. "A visitor," she says with surprise. "I am Seraphina, daughter of the dragon. If you seek the Eye, you must first prove yourself worthy by answering three riddles."`,
        },
        {
          text: "Follow the sound of running water",
          nextSegment: `The passage opens into a breathtaking underground grotto. A waterfall cascades from high above, creating a misty rainbow in the dim light. At the water's edge, you find a group of dwarven miners, their equipment scattered around them. Their leader, a grizzled dwarf with a braided beard, looks up in alarm. "Human! What are you doing here? We've been trapped for three days—the dragon sealed the exits when it sensed our presence. But we've discovered something... a secret passage that leads directly to the dragon's treasure chamber. If you help us escape, we'll show you the way."`,
        },
      ],
    },
  ],
  scifi: [
    {
      opening: `The space station's alarms blare as you rush through the corridor. Red emergency lights pulse in rhythm with your racing heart. Three hours ago, the research team on Deck 7 stopped responding. Two hours ago, the security feeds went dark. One hour ago, something started moving through the ventilation system.

You're the station's chief security officer, and you've just received a garbled transmission: "...not human... changing us... don't let it reach the..." Then static. Your handheld scanner shows three possible locations where the team might be: the main laboratory, the cryogenic storage bay, or the observation deck overlooking the planet below.`,
      choices: [
        {
          text: "Head to the main laboratory",
          nextSegment: `The laboratory doors are sealed, but your override code still works. Inside, you find the research team's equipment scattered across the floor, experiments abandoned mid-process. But what catches your attention is the containment pod in the center of the room—it's open, and empty. Dr. Chen's voice crackles over your comm: "Don't come any closer. We... we made contact with something. It's not hostile, but it's changing us. We can see things now, understand things. The universe is so much bigger than we thought. You have a choice: join us in evolution, or seal this section and condemn us to isolation."`,
        },
        {
          text: "Check the cryogenic storage bay",
          nextSegment: `The temperature drops dramatically as you enter the cryo bay. Your breath mists in the air. The pods line the walls, each containing a colonist in suspended animation, waiting for the journey to their new home. But something's wrong—several pods are open, their occupants missing. Then you see them: the research team, huddled around one particular pod. Inside is something that definitely isn't human—a crystalline entity pulsing with bioluminescent light. "It's beautiful," whispers Dr. Patel. "It came from the planet below. It's trying to communicate, but we need your help to understand it."`,
        },
        {
          text: "Go to the observation deck",
          nextSegment: `The observation deck offers a stunning view of the planet below—a world of swirling purple clouds and electric blue oceans. But you're not here for the view. You find the research team gathered around the main telescope, all of them staring at something on the monitors. Dr. Rodriguez turns to you, her eyes wide with a mixture of fear and wonder. "We found something. A structure on the planet's surface. It's massive, ancient, and it's been sending a signal. We decoded part of it. It's a warning: 'The Sleepers are waking. Leave this system before the cycle completes.' We have 48 hours."`,
        },
      ],
    },
  ],
  mystery: [
    {
      opening: `The grandfather clock strikes midnight as you stand in the study of Blackwood Manor. Lord Blackwood lies dead on the Persian rug, a single bullet wound to the chest. The murder weapon—a antique revolver—rests on his desk. But something doesn't add up. The windows are locked from the inside, the door was bolted, and you were the first to arrive after hearing the shot.

Six people were in the manor tonight: Lady Blackwood, the victim's wife; James, the butler; Sarah, the maid; Dr. Thornton, the family physician; Margaret, Lord Blackwood's sister; and you, the detective called to investigate a series of threatening letters. Each has a motive, each has secrets. The storm outside ensures no one can leave until morning.`,
      choices: [
        {
          text: "Question Lady Blackwood first",
          nextSegment: `You find Lady Blackwood in the drawing room, composed despite the circumstances. "My husband and I had our difficulties," she admits, "but I didn't kill him. I was in my chambers when I heard the shot. However, I should tell you something—three months ago, I discovered he had changed his will. Everything goes to his sister Margaret now, not to me. I confronted him about it last week." She pauses, then adds quietly, "There's something else. The gun on his desk? It's not the one from his collection. I know every piece he owned. That revolver... I've never seen it before."`,
        },
        {
          text: "Examine the study more carefully",
          nextSegment: `You begin a methodical search of the study. Behind a bookshelf, you discover a hidden safe—it's open, and empty. On the desk, beneath some papers, you find a telegram dated yesterday: "Your secret is no longer safe. Meet me tonight or face exposure. -A.M." The initials could match several people. Then you notice something odd about the bullet wound—the angle suggests the shot came from above, not straight on. You look up and see a ventilation grate in the ceiling, just large enough for someone small to fit through.`,
        },
        {
          text: "Speak with James the butler",
          nextSegment: `James has served the Blackwood family for thirty years, and his hands shake as he pours you tea. "I heard the shot from the kitchen, sir. But I must confess something—I saw someone in the hallway just before. A figure in a dark cloak, moving toward the study. I couldn't see their face." He hesitates, then continues, "Lord Blackwood received a visitor this afternoon. They argued. I heard Lord Blackwood say, 'You can't prove anything.' The visitor replied, 'I don't need to prove it. I just need to tell the right people.' Then the visitor left through the garden gate."`,
        },
      ],
    },
  ],
  romance: [
    {
      opening: `The coffee shop is your sanctuary, a place where you've spent countless mornings writing in your journal and watching the world go by. But today is different. Today, you accidentally grabbed someone else's laptop bag—and they grabbed yours. The mix-up only became apparent when you opened it to find not your manuscript, but a collection of architectural blueprints and a leather journal filled with sketches and poetry.

A note falls out: "If you're reading this, we've swapped bags. I have your laptop. Meet me at the fountain in Central Park at sunset. I'll be the one reading your manuscript (sorry, couldn't resist). - A." Your manuscript is your most personal work, filled with your hopes, dreams, and secrets. The thought of a stranger reading it makes your heart race—but there's something intriguing about their note.`,
      choices: [
        {
          text: "Go to the fountain at sunset",
          nextSegment: `You arrive at the fountain as the sun paints the sky in shades of orange and pink. There, sitting on the edge of the fountain with your laptop bag beside them, is someone who takes your breath away. They look up from your manuscript, and their smile is warm and genuine. "I hope you don't mind," they say, "but I couldn't stop reading. Your words... they're beautiful. They made me feel things I haven't felt in years." They hand you your bag, and you notice their hands are stained with ink. "I'm Alex, by the way. Architect by day, hopeless romantic by night. Your manuscript inspired me to finish something I've been working on for months. Would you like to see it?"`,
        },
        {
          text: "Read through their journal first",
          nextSegment: `You spend the afternoon reading through their journal, and with each page, you feel a strange connection forming. Their sketches show buildings that blend dreams with reality—impossible structures that somehow feel right. But it's their poetry that truly moves you. One poem in particular seems to describe feelings you've had but never put into words. At the bottom of the page, there's a phone number and a message: "If these words resonate with you, call me. If not, leave my bag at the coffee shop and we'll pretend this never happened. But I hope you call. - Alex." Your phone feels heavy in your hand.`,
        },
        {
          text: "Leave a note in their bag and return it to the coffee shop",
          nextSegment: `You write a note: "Your journal is beautiful. Your words touched something in me I thought was lost. But I'm not ready for this kind of connection. I'm sorry. - You." You leave their bag at the coffee shop and try to move on. But over the next few days, you can't stop thinking about their poetry, their sketches, their words. Then, a week later, you receive a package. Inside is a book—a published collection of poetry and architectural sketches. The dedication reads: "To the writer who reminded me why I create. Thank you for reading my words, even if you couldn't stay to hear more. - Alex." There's a bookmark on one page, a poem titled "The One Who Got Away."`,
        },
      ],
    },
  ],
  adventure: [
    {
      opening: `The treasure map crinkles in your pocket as you stand at the edge of the jungle. Behind you, the ocean waves crash against the shore. Ahead, dense vegetation hides secrets that have remained buried for three hundred years. According to the map, Captain Redbeard's legendary treasure lies somewhere in the heart of this island, protected by traps, puzzles, and possibly worse.

You're not alone in your quest. Two other treasure hunters arrived on the island yesterday: Marcus, a historian who claims to have decoded Redbeard's journal, and Elena, a skilled tracker who's been searching for this treasure for five years. They've proposed an alliance, but can you trust them? The map shows three possible routes to the treasure: through the ancient temple ruins, across the volcanic ridge, or via the underground river system.`,
      choices: [
        {
          text: "Take the route through the ancient temple ruins",
          nextSegment: `The temple rises from the jungle like a stone giant, covered in vines and centuries of growth. Marcus leads the way, translating the inscriptions on the walls. "These aren't just decorations," he explains. "They're warnings. 'Only the worthy may pass. The greedy will find only death.'" Inside, you discover a chamber with three doors, each marked with a different symbol: a sun, a moon, and a star. Elena examines the floor and finds pressure plates. "One wrong step and we trigger the traps. But look—there's a pattern in the dust. Someone's been here before, and recently."`,
        },
        {
          text: "Cross the volcanic ridge",
          nextSegment: `The climb is treacherous, with loose rocks and sudden drops. Halfway up, you discover a cave entrance hidden behind a waterfall. Inside, you find evidence of a camp—someone's been living here. Elena finds a journal: "Day 47: I'm so close. The treasure is real. But Redbeard was clever. The map everyone seeks is a fake, a test. The real treasure isn't where they think." The journal ends abruptly. Then you hear voices—other treasure hunters are approaching the cave. You have seconds to decide: hide and listen, or confront them?`,
        },
        {
          text: "Navigate the underground river system",
          nextSegment: `You descend into the cave system, following the sound of rushing water. The underground river is swift and cold, but navigable with the inflatable raft you brought. As you float deeper into the darkness, your flashlight reveals ancient carvings on the walls—a story told in pictures. Marcus gasps: "This changes everything. Redbeard didn't hide treasure here. He hid something far more valuable—the location of El Dorado, the lost city of gold. The 'treasure' everyone seeks is just a map to the real prize." Suddenly, the current picks up, pulling you toward a waterfall. You hear the roar of falling water ahead.`,
        },
      ],
    },
  ],
}

export function generateDemoStory(
  genreId: string,
  personalityTraits: Record<string, number>,
  previousContent?: string,
): { content: string; choices: Array<{ id: string; text: string; consequence: string }> } {
  const templates = STORY_TEMPLATES[genreId] || STORY_TEMPLATES.fantasy

  // If this is the first segment, use the opening
  if (!previousContent) {
    const template = templates[Math.floor(Math.random() * templates.length)]
    return {
      content: template.opening,
      choices: template.choices.map((choice, index) => ({
        id: `choice-${index}`,
        text: choice.text,
        consequence: "",
      })),
    }
  }

  // For subsequent segments, find the matching choice and return its next segment
  // In a real implementation, this would track which choice was made
  // For demo purposes, we'll return a continuation based on personality
  const template = templates[0]
  const choiceIndex = Math.floor(Math.random() * template.choices.length)
  const nextSegment = template.choices[choiceIndex].nextSegment

  // Generate new choices for the next segment
  const newChoices = [
    { id: "choice-0", text: "Continue exploring this path", consequence: "" },
    { id: "choice-1", text: "Look for an alternative route", consequence: "" },
    { id: "choice-2", text: "Take a moment to assess the situation", consequence: "" },
  ]

  return {
    content: nextSegment,
    choices: newChoices,
  }
}
