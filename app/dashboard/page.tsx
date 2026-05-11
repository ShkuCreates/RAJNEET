import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardHomeClient from "@/components/dashboard/DashboardHomeClient";

export const dynamic = "force-dynamic";

const CATEGORY_FILTERS: Record<string, string[]> = {
  Politics: ["POLITICS", "POLITICAL"],
  Finance: ["FINANCE"],
  Sports: ["SPORTS"],
  World: ["WORLD", "INTERNATIONAL"],
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const selectedCategory = searchParams.category || null;
  const categoryValues = selectedCategory ? CATEGORY_FILTERS[selectedCategory] ?? [selectedCategory.toUpperCase()] : null;

  const news = await prisma.news.findMany({
    where: {
      status: "PUBLISHED",
      ...(categoryValues ? { category: { in: categoryValues } } : {}),
    },
    include: {
      author: {
        select: { name: true, avatar_url: true, role: true },
      },
      _count: {
        select: { opinions: true, upvotes: true, pageViews: true },
      },
      upvotes: user ? {
        where: { user_id: user.id },
        select: { user_id: true }
      } : false,
      opinions: {
        select: { stance: true },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  const latestArticle = await prisma.news.findFirst({
    where: {
      status: "PUBLISHED",
    },
    orderBy: {
      created_at: "desc",
    },
    select: {
      created_at: true,
    },
  });

  return (
    <DashboardHomeClient
      news={news}
      currentUser={user}
      selectedCategory={selectedCategory}
      latestFetchAt={latestArticle?.created_at.toISOString() ?? null}
    />
  );
}
