import { prisma } from "./prisma";
import { sendWeeklyDigestEmail } from "./email";

export async function generateWeeklyDigest() {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7); // Go back 7 days
  weekStart.setHours(0, 0, 0, 0);

  try {
    // Get top news from last week
    const topNews = await prisma.news.findMany({
      where: {
        created_at: { gte: weekStart },
      },
      orderBy: { view_count: "desc" },
      take: 5,
      select: {
        headline: true,
        slug: true,
      },
    });

    // Get top debate result from last week
    const completedDebates = await prisma.debate.findMany({
      where: {
        status: "COMPLETED",
        ended_at: { gte: weekStart },
      },
      orderBy: { ended_at: "desc" },
      take: 1,
      include: {
        participants: true,
      },
    });

    const topDebateResult = completedDebates[0] ? {
      topic: completedDebates[0].topic,
      winner: completedDebates[0].winner_side,
      participantCount: completedDebates[0].participants.length,
    } : null;

    // Get top article from last week
    const topArticle = await prisma.article.findMany({
      where: {
        created_at: { gte: weekStart },
      },
      orderBy: { view_count: "desc" },
      take: 1,
      select: {
        title: true,
        slug: true,
      },
    });

    // Get top opinion from last week
    const topOpinion = await prisma.opinion.findMany({
      where: {
        created_at: { gte: weekStart },
      },
      orderBy: { upvotes: "desc" },
      take: 1,
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    // Get all users subscribed to weekly digest
    const subscribers = await prisma.debateNotificationSubscriber.findMany({
      where: {
        is_active: true,
      },
      select: {
        email: true,
      },
    });

    // Send digest to all subscribers
    const digestData = {
      topNews: topNews.map(news => ({
        headline: news.headline,
        url: `/news/${news.slug}`,
      })),
      topDebateResult: topDebateResult ? `${topDebateResult.winner} won "${topDebateResult.topic}"` : "No debates completed",
      topArticle: topArticle[0] ? topArticle[0].title : "No articles published",
      topOpinion: topOpinion[0] ? `${topOpinion[0].user.username}: "${topOpinion[0].content.substring(0, 100)}..."` : "No opinions posted",
    };

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      for (const subscriber of batch) {
        try {
          await sendWeeklyDigestEmail({
            to: subscriber.email,
            ...digestData,
          });
        } catch (error) {
          console.error(`Failed to send digest to ${subscriber.email}:`, error);
        }
      }

      // Wait between batches to respect rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between batches
      }
    }

    return {
      success: true,
      sentTo: subscribers.length,
      digestData,
    };
  } catch (error) {
    console.error("Error generating weekly digest:", error);
    return { success: false, error };
  }
}
