"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { type Story, STORY_GENRES } from "@/lib/story-data"
import { BOOK_THEMES, DEFAULT_THEME } from "@/lib/book-themes"
import { BookLayout } from "@/components/book-layout"
import { BookOpen, CheckCircle2, ArrowRight, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import jsPDF from "jspdf"

interface ProfileResponse {
  id?: string
}

export default function StoryCompletePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const storyId = params?.id

  const [story, setStory] = useState<Story | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const theme = useMemo(() => {
    if (!story) return DEFAULT_THEME
    return BOOK_THEMES[story.genre] || DEFAULT_THEME
  }, [story])

  useEffect(() => {
    const load = async () => {
      if (!storyId) {
        setIsLoading(false)
        return
      }

      try {
        const [storyRes, profileRes] = await Promise.all([
          fetch(`/api/stories/${storyId}`),
          fetch("/api/auth/profile"),
        ])

        if (storyRes.ok) {
          const data = await storyRes.json()
          const loadedStory = data.story as Story
          // Initialize fullStoryContent if it doesn't exist (for older stories)
          if (!loadedStory.fullStoryContent && loadedStory.content) {
            loadedStory.fullStoryContent = [
              {
                chapterIndex: 0,
                content: loadedStory.content,
                choices: loadedStory.choices || [],
              },
            ]
          }
          setStory(loadedStory)
        }

        if (profileRes.ok) {
          const profile = (await profileRes.json()) as ProfileResponse
          if (profile.id) setUserId(profile.id)
        }
      } catch (err) {
        console.error("Failed to load completion data", err)
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [storyId])

  const handleGoToDashboard = () => {
    if (userId) {
      router.push(`/dashboard/${userId}`)
    } else {
      router.push("/dashboard")
    }
  }

  const handleDownloadPdf = async () => {
    if (!story) return

    setIsGeneratingPdf(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const maxWidth = pageWidth - 2 * margin
      let yPosition = margin

      // Title
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text(story.title, margin, yPosition)
      yPosition += 10

      // Genre
      const genre = STORY_GENRES.find((g) => g.id === story.genre)
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(100, 100, 100)
      doc.text(genre?.name || "Story", margin, yPosition)
      yPosition += 15

      // Full story content
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")

      if (story.fullStoryContent && story.fullStoryContent.length > 0) {
        story.fullStoryContent.forEach((chapter, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 40) {
            doc.addPage()
            yPosition = margin
          }

          // Chapter number
          doc.setFont("helvetica", "bold")
          doc.setFontSize(12)
          doc.text(`Chapter ${chapter.chapterIndex + 1}`, margin, yPosition)
          yPosition += 8

          // Chapter content
          doc.setFont("helvetica", "normal")
          doc.setFontSize(11)
          const chapterLines = doc.splitTextToSize(chapter.content, maxWidth)
          chapterLines.forEach((line: string) => {
            if (yPosition > pageHeight - 30) {
              doc.addPage()
              yPosition = margin
            }
            doc.text(line, margin, yPosition)
            yPosition += 6
          })

          yPosition += 5

          // Selected choice (if available)
          if (chapter.selectedChoice) {
            if (yPosition > pageHeight - 30) {
              doc.addPage()
              yPosition = margin
            }
            doc.setFont("helvetica", "italic")
            doc.setTextColor(50, 50, 50)
            const choiceLabel = story.isMultiplayer ? "Group choice: " : "You chose: "
            doc.text(`${choiceLabel}${chapter.selectedChoice.text}`, margin, yPosition)
            yPosition += 8
            doc.setTextColor(0, 0, 0)
            doc.setFont("helvetica", "normal")
          }

          yPosition += 10
        })

        // Final chapter (if exists and not in fullStoryContent)
        if (story.content && (!story.fullStoryContent.length || 
            story.fullStoryContent[story.fullStoryContent.length - 1]?.content !== story.content)) {
          if (yPosition > pageHeight - 40) {
            doc.addPage()
            yPosition = margin
          }

          doc.setFont("helvetica", "bold")
          doc.setFontSize(12)
          doc.text(`Chapter ${story.currentChoiceIndex + 1}`, margin, yPosition)
          yPosition += 8

          doc.setFont("helvetica", "normal")
          doc.setFontSize(11)
          const finalLines = doc.splitTextToSize(story.content, maxWidth)
          finalLines.forEach((line: string) => {
            if (yPosition > pageHeight - 30) {
              doc.addPage()
              yPosition = margin
            }
            doc.text(line, margin, yPosition)
            yPosition += 6
          })
        }
      } else {
        // Fallback to current content if fullStoryContent is not available
        const lines = doc.splitTextToSize(story.content, maxWidth)
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage()
            yPosition = margin
          }
          doc.text(line, margin, yPosition)
          yPosition += 6
        })
      }

      // Save PDF
      doc.save(`${story.title.replace(/[^a-z0-9]/gi, "_")}.pdf`)
      toast.success("PDF downloaded successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate PDF. Please try again.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  if (isLoading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", theme.styles.container)}>
        <div className="text-center">
          <Loader2 className={cn("w-12 h-12 mx-auto mb-4 animate-spin", theme.styles.text)} />
          <p className={cn("font-serif italic", theme.styles.text)}>Wrapping up your adventure...</p>
        </div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center px-4", theme.styles.container)}>
        <div className={cn("text-center space-y-4 p-8 rounded-lg", theme.styles.page)}>
          <p className={cn(theme.styles.text)}>We could not find this story. Try creating a new one.</p>
          <Link href="/stories/new">
            <Button className={cn("mt-4", theme.styles.choice)}>Create New Story</Button>
          </Link>
        </div>
      </div>
    )
  }

  const genre = STORY_GENRES.find((g) => g.id === story.genre)
  const fullStory = story.fullStoryContent || []
  // Calculate total chapters: currentChoiceIndex represents choices made, so chapters = currentChoiceIndex + 1
  // This accounts for the initial chapter (index 0) plus all subsequent chapters
  const totalChapters = (story.currentChoiceIndex ?? 0) + 1

  return (
    <BookLayout
      genre={story.genre}
      currentPage={0}
      onPageTurn={() => {}}
      leftContent={
        <div className="flex flex-col h-full">
          <div className="text-center mb-6">
            <CheckCircle2 className={cn("w-16 h-16 mx-auto mb-4", theme.styles.accent)} />
            <h1 className={cn("text-3xl font-bold mb-2", theme.styles.heading)}>Story Complete!</h1>
            <p className={cn("text-sm italic", theme.styles.text)}>
              Your journey has reached its conclusion. Every choice you made shaped this tale.
            </p>
          </div>

          <div className="flex-1 space-y-4">
            <div className={cn("p-4 rounded-lg border", theme.styles.choice)}>
              <h2 className={cn("font-bold mb-2", theme.styles.heading)}>{story.title}</h2>
              <p className={cn("text-xs opacity-70", theme.styles.text)}>
                {genre?.name} • {totalChapters} Chapters
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <Button
              onClick={handleGoToDashboard}
              className={cn("w-full", theme.styles.choice)}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Link href="/stories/new">
              <Button variant="outline" className={cn("w-full", theme.styles.choice)}>
                Create Another Story
              </Button>
            </Link>
            <Button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className={cn("w-full", theme.styles.choice)}
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      }
      rightContent={
        <div className="flex flex-col h-full">
          <h2 className={cn("text-xl font-bold mb-4 text-center", theme.styles.heading)}>
            Your Complete Story
          </h2>
          <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar">
            {fullStory.length > 0 ? (
              fullStory.map((chapter, index) => (
                <div key={index} className={cn("space-y-3", theme.styles.text)}>
                  <h3 className={cn("font-bold text-sm", theme.styles.heading)}>
                    Chapter {chapter.chapterIndex + 1}
                  </h3>
                  <p className={cn("text-sm leading-relaxed whitespace-pre-wrap", theme.styles.text)}>
                    {chapter.content}
                  </p>
                  {chapter.selectedChoice && (
                    <div className={cn("p-3 rounded border-l-4 italic text-sm", theme.styles.choice)}>
                      <span className="font-semibold">
                        {story.isMultiplayer ? "Group choice: " : "You chose: "}
                      </span>
                      {chapter.selectedChoice.text}
                    </div>
                  )}
                  {index < fullStory.length - 1 && (
                    <div className={cn("border-t my-4 opacity-30", theme.styles.accent)} />
                  )}
                </div>
              ))
            ) : (
              <p className={cn("text-sm", theme.styles.text)}>
                {story.content}
              </p>
            )}
            {/* Final chapter if exists */}
            {story.content && (!fullStory.length || 
              fullStory[fullStory.length - 1]?.content !== story.content) && (
              <div className={cn("space-y-3 mt-6", theme.styles.text)}>
                {fullStory.length > 0 && (
                  <div className={cn("border-t my-4 opacity-30", theme.styles.accent)} />
                )}
                <h3 className={cn("font-bold text-sm", theme.styles.heading)}>
                  Chapter {story.currentChoiceIndex + 1}
                </h3>
                <p className={cn("text-sm leading-relaxed whitespace-pre-wrap", theme.styles.text)}>
                  {story.content}
                </p>
              </div>
            )}
          </div>
        </div>
      }
    />
  )
}
