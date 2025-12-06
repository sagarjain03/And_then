# StoryWeave - AI-Powered Personalized Storytelling Platform

## Overview

StoryWeave is an innovative platform that combines personality psychology with AI-generated storytelling. Users take a personality test, and the platform generates personalized, interactive stories tailored to their unique traits and preferences.

## Features

- **Personality Test**: 16-question assessment measuring 8 personality dimensions
- **AI Story Generation**: Dynamic story creation using OpenAI's GPT-4o-mini model
- **Interactive Gameplay**: Choose-your-own-adventure style with meaningful choices
- **Multiple Genres**: Fantasy, Science Fiction, Mystery, Romance, and Adventure
- **Story Management**: Save, continue, and manage your story collection
- **Personalized Profiles**: View detailed personality analysis and trait scores

## Tech Stack

- **Frontend**: Next.js 16 with React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI
- **AI Integration**: Vercel AI SDK with OpenAI GPT-4o-mini
- **Storage**: Currently using localStorage (ready for database integration)
- **Database**: PostgreSQL schema provided (Supabase/Neon compatible)

## Project Structure

\`\`\`
app/
├── page.tsx                 # Landing page
├── auth/
│   ├── login/page.tsx      # Login page
│   └── signup/page.tsx     # Signup page
├── test/
│   ├── page.tsx            # Personality test
│   └── results/page.tsx    # Test results
├── stories/
│   ├── new/page.tsx        # Story genre selection
│   └── play/page.tsx       # Story gameplay
├── dashboard/page.tsx      # User dashboard
├── api/
│   ├── auth/               # Authentication endpoints
│   ├── stories/            # Story management endpoints
│   └── personality/        # Personality endpoints
└── globals.css             # Theme and styling

lib/
├── personality-data.ts     # Personality test data and scoring
├── story-data.ts           # Story genres and generation logic
└── db-utils.ts             # Database utility functions
\`\`\`

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see below)
4. Run development server: `npm run dev`
5. Open http://localhost:3000

### Environment Variables

Create a `.env.local` file with:

\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3000
# AI SDK will use Vercel AI Gateway by default
# No additional API keys needed for OpenAI through the gateway
\`\`\`

## Database Integration

The application currently uses localStorage for development. To integrate with a real database:

1. Choose a database provider (Supabase, Neon, or PlanetScale)
2. Run the SQL schema from `lib/db-schema.sql`
3. Implement the functions in `lib/db-utils.ts`
4. Update API routes to use database functions instead of in-memory storage

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login

### Personality
- `POST /api/personality/save` - Save personality test results

### Stories
- `POST /api/stories/generate` - Generate new story content
- `POST /api/stories/save` - Save story progress
- `GET /api/stories/list` - Get user's saved stories

## Future Enhancements

- [ ] Real database integration (Supabase/Neon)
- [ ] User authentication with JWT tokens
- [ ] Google OAuth integration
- [ ] Story sharing and community features
- [ ] Advanced personality analytics
- [ ] Mobile app version
- [ ] Story recommendations based on personality
- [ ] Multiplayer story experiences
- [ ] Story export (PDF, ePub)
- [ ] Advanced AI models and fine-tuning

## Development Notes

### Adding New Story Genres

1. Add genre to `STORY_GENRES` in `lib/story-data.ts`
2. Update story generation prompts as needed
3. Test story generation with new genre

### Customizing Personality Traits

1. Modify `PERSONALITY_TRAITS` in `lib/personality-data.ts`
2. Update `PERSONALITY_QUESTIONS` with new trait mappings
3. Adjust scoring algorithm in `calculatePersonalityScores()`

### Styling

The application uses Tailwind CSS v4 with custom design tokens. Modify `app/globals.css` to change the color scheme and theme.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub or contact support.
