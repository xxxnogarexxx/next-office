import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Ratgeber – Tipps zur Bürosuche",
  description:
    "Ratgeber und Guides rund um das Thema Büro mieten: Städteguides, Preisvergleiche und praktische Tipps für Ihre Bürosuche.",
  openGraph: {
    title: "Ratgeber – Tipps zur Bürosuche | NextOffice",
    description:
      "Ratgeber und Guides rund um das Thema Büro mieten.",
    type: "website",
    url: "https://next-office.io/blog",
  },
  alternates: {
    canonical: "https://next-office.io/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Ratgeber</h1>
        <p className="mt-2 text-lg text-body">
          Tipps, Guides und Markteinblicke für Ihre Bürosuche.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {post.category}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-text">
                  <Clock className="h-3 w-3" />
                  {post.readingTime} Min.
                </span>
              </div>

              <h2 className="mt-3 text-lg font-semibold text-foreground group-hover:text-body transition-colors">
                {post.title}
              </h2>

              <p className="mt-2 text-sm text-body line-clamp-2">
                {post.excerpt}
              </p>

              <p className="mt-4 text-xs text-muted-text">
                {new Date(post.date).toLocaleDateString("de-DE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
