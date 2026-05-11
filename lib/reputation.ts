import { prisma } from "./prisma";

export interface ReputationEvent {
  event_type: string;
  points_change: number;
  reference_id?: string;
}

export function getReputationTier(score: number): string {
  if (score >= 5000) return "RAJNEET Legend";
  if (score >= 2500) return "Political Analyst";
  if (score >= 1000) return "Community Leader";
  if (score >= 500) return "Voice of the People";
  if (score >= 200) return "Active Citizen";
  return "Citizen";
}

export function getReputationBadgeColor(score: number): string {
  if (score >= 5000) return "bg-gradient-to-r from-purple-500 to-pink-500";
  if (score >= 2500) return "bg-purple-500";
  if (score >= 1000) return "bg-yellow-500";
  if (score >= 500) return "bg-green-500";
  if (score >= 200) return "bg-blue-500";
  return "bg-gray-500";
}

export async function addReputationEvent(userId: string, event: ReputationEvent) {
  // Create reputation event
  await prisma.reputationEvent.create({
    data: {
      user_id: userId,
      event_type: event.event_type,
      points_change: event.points_change,
      reference_id: event.reference_id,
    },
  });

  // Update user reputation score
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { reputation_score: true },
  });

  if (user) {
    const newScore = user.reputation_score + event.points_change;
    const newTier = getReputationTier(newScore);
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        reputation_score: newScore,
        reputation_tier: newTier,
      },
    });

    return { newScore, newTier };
  }

  return null;
}

export async function calculateReputationFromEvents(userId: string) {
  const events = await prisma.reputationEvent.findMany({
    where: { user_id: userId },
  });

  const totalPoints = events.reduce((sum, event) => sum + event.points_change, 0);
  return totalPoints;
}
