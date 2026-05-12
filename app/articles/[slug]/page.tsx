import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticlePageClient from "@/components/articles/ArticlePageClient";

export async function generateStaticParams() {
  // Return empty array to avoid database connection issues during build
  // Routes will be generated dynamically at runtime
  return [];
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
