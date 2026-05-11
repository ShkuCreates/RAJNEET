import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticlePageClient from "@/components/articles/ArticlePageClient";

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { status: "approved" },
    select: { slug: true },
    take: 50,
  });

  return articles
    .map((article) => ({
      slug: article.slug || article.id,
    }))
    .filter((item) => item.slug);
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
      status: "approved",
    },
  });

  if (!article) {
    return {
      title: "Article Not Found - RAJNEET",
    };
  }

  return {
    title: `${article.title} - RAJNEET`,
    description: article.excerpt || article.title,
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
      status: "approved",
    },
  });

  if (!article) {
    notFound();
  }

  return <ArticlePageClient article={article} />;
}
