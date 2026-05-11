import { prisma } from "./prisma";

export async function selectJuryForDebate(debateId: string) {
  // Find 5 users with reputation > 300 who did NOT participate in the debate
  const participants = await prisma.debateParticipant.findMany({
    where: { debate_id: debateId },
    select: { user_id: true },
  });

  const participantIds = participants.map((p) => p.user_id);

  const eligibleJurors = await prisma.user.findMany({
    where: {
      reputation_score: { gte: 300 },
      id: { notIn: participantIds },
    },
    take: 10, // Get 10 candidates to randomly select from
  });

  // Randomly select 5 jurors
  const shuffled = eligibleJurors.sort(() => 0.5 - Math.random());
  const selectedJurors = shuffled.slice(0, 5);

  return selectedJurors;
}

export async function calculateDebateWinner(debateId: string) {
  // Get all arguments for the debate
  const arguments = await prisma.debateArgument.findMany({
    where: { debate_id: debateId },
    include: {
      juryVotes: true,
    },
  });

  // Calculate jury scores for each side
  const forArguments = arguments.filter((a) => a.side === "FOR");
  const againstArguments = arguments.filter((a) => a.side === "AGAINST");

  // Get top 5 arguments by likes for each side
  const topFor = forArguments.sort((a, b) => b.like_count - a.like_count).slice(0, 5);
  const topAgainst = againstArguments.sort((a, b) => b.like_count - a.like_count).slice(0, 5);

  // Calculate jury scores (logic + evidence + clarity, max 30 per argument)
  const calculateJuryScore = (arg: any) => {
    const juryVotes = arg.juryVotes || [];
    if (juryVotes.length === 0) return 0;

    const logicScore = juryVotes.reduce((sum: number, v: any) => sum + (v.logic_score || 0), 0) / juryVotes.length;
    const evidenceScore = juryVotes.reduce((sum: number, v: any) => sum + (v.evidence_score || 0), 0) / juryVotes.length;
    const clarityScore = juryVotes.reduce((sum: number, v: any) => sum + (v.clarity_score || 0), 0) / juryVotes.length;

    return logicScore + evidenceScore + clarityScore;
  };

  const forJuryScore = topFor.reduce((sum, arg) => sum + calculateJuryScore(arg), 0);
  const againstJuryScore = topAgainst.reduce((sum, arg) => sum + calculateJuryScore(arg), 0);

  // Calculate total likes for each side
  const forLikes = forArguments.reduce((sum, arg) => sum + arg.like_count, 0);
  const againstLikes = againstArguments.reduce((sum, arg) => sum + arg.like_count, 0);

  // Calculate final scores (jury 60%, likes 40%)
  const maxJuryScore = forJuryScore + againstJuryScore || 1;
  const maxLikes = forLikes + againstLikes || 1;

  const forFinalScore = (forJuryScore / maxJuryScore) * 60 + (forLikes / maxLikes) * 40;
  const againstFinalScore = (againstJuryScore / maxJuryScore) * 60 + (againstLikes / maxLikes) * 40;

  const winner = forFinalScore > againstFinalScore ? "FOR" : againstFinalScore > forFinalScore ? "AGAINST" : "TIE";

  // Update debate with winner
  await prisma.debate.update({
    where: { id: debateId },
    data: { winner_side: winner },
  });

  // Award reputation to winners
  if (winner !== "TIE") {
    const winningSideParticipants = await prisma.debateParticipant.findMany({
      where: { debate_id: debateId, side: winner },
      select: { user_id: true },
    });

    for (const participant of winningSideParticipants) {
      // Add reputation event
      await prisma.reputationEvent.create({
        data: {
          user_id: participant.user_id,
          event_type: "debate_won",
          points_change: 50,
          reference_id: debateId,
        },
      });

      // Update user reputation
      const user = await prisma.user.findUnique({
        where: { id: participant.user_id },
        select: { reputation_score: true },
      });

      if (user) {
        const newScore = user.reputation_score + 50;
        const newTier = getReputationTier(newScore);
        await prisma.user.update({
          where: { id: participant.user_id },
          data: {
            reputation_score: newScore,
            reputation_tier: newTier,
          },
        });
      }
    }
  }

  return {
    winner,
    forScore: forFinalScore,
    againstScore: againstFinalScore,
    forJuryScore,
    againstJuryScore,
    forLikes,
    againstLikes,
  };
}

function getReputationTier(score: number): string {
  if (score >= 5000) return "RAJNEET Legend";
  if (score >= 2500) return "Political Analyst";
  if (score >= 1000) return "Community Leader";
  if (score >= 500) return "Voice of the People";
  if (score >= 200) return "Active Citizen";
  return "Citizen";
}
