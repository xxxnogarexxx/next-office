import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { MarkdownContent } from "@/components/markdown-content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Nicht gefunden" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `https://next-office.io/blog/${slug}`,
      images: [{ url: post.coverImage }],
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `https://next-office.io/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.date,
    dateModified: post.dateModified || post.date,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "NextOffice",
      url: "https://next-office.io",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Startseite",
                item: "https://next-office.io",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Ratgeber",
                item: "https://next-office.io/blog",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: `https://next-office.io/blog/${slug}`,
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-1 text-sm text-body hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Alle Artikel
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="flex items-center gap-1 text-sm text-muted-text">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime} Min. Lesezeit
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-text">
          <User className="h-3.5 w-3.5" />
          <span>{post.author}</span>
          <span>·</span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("de-DE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </div>

        {/* Cover image */}
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>

        {/* Article body */}
        <div className="mt-10">
          <MarkdownContent content={post.content} />
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-lg border bg-surface p-6 text-center">
          <h3 className="text-lg font-semibold">
            Suchen Sie ein Büro?
          </h3>
          <p className="mt-1 text-sm text-body">
            Wir helfen Ihnen kostenlos bei der Bürosuche.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Büros finden
          </Link>
        </div>
      </article>
    </>
  );
}
