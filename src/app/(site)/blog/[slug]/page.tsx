import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Link from "next/link";
import Image from "next/image";
import { blogService } from "@/services/blog.service";
import ProductCard from "@/components/site/ProductCard";
import Reveal from "@/components/site/Reveal";
import BlogContentRenderer from "./_components/BlogContentRenderer";
import BlogComments from "./_components/BlogComments";

export const revalidate = 60;

interface BlogDetail {
  id: string;
  slug: string;
  title: string;
  subTitle?: string | null;
  tags: string[];
  content: unknown;
  status: string;
  coverImage?: string | null;
  publishedAt?: string | Date | null;
  createdAt: string | Date;
  author: { name?: string | null; image?: string | null };
  products: {
    id: string;
    slug: string;
    name: string;
    brand?: string | null;
    thumbnailUrl?: string | null;
    shortDescription: string;
    rating: number;
    ratingCount: number;
    price?: number | string | { toString(): string } | null;
    originalPrice?: number | string | { toString(): string } | null;
    currency: string;
    category?: { name: string; slug: string } | null;
  }[];
}

// Dedupe generateMetadata() + page-body fetches within one request (see the
// identical comment on the product detail page for why this matters).
const getBlog = cache(
  (slug: string): Promise<BlogDetail | null> => blogService.getBySlug(slug),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog || blog.status !== "PUBLISHED")
    return { title: "Article Not Found" };

  const description = blog.subTitle || blog.title;

 

  return {
    title: blog.title,
    description,
    openGraph: {
      title: blog.title,
      description,
      images: blog.coverImage ? [blog.coverImage] : [],
      type: "article",
      publishedTime: blog.publishedAt
        ? new Date(blog.publishedAt).toISOString()
        : undefined,
      authors: blog.author?.name ? [blog.author.name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description,
      images: blog.coverImage ? [blog.coverImage] : [],
    },
    alternates: { canonical: `/blog/${blog.slug}` },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  // Never expose drafts, pending, scheduled, or rejected posts publicly.
  if (!blog || blog.status !== "PUBLISHED") notFound();

  const date = blog.publishedAt || blog.createdAt;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.subTitle,
    image: blog.coverImage ? [blog.coverImage] : [],
    datePublished: new Date(date).toISOString(),
    author: {
      "@type": "Person",
      name: blog.author?.name || "TechToCheck Team",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <nav
          className="mb-6 text-sm text-foreground-muted"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-accent">
            Articles
          </Link>
        </nav>

        <Reveal>
          {blog.tags?.[0] && (
            <Link
              href={`/blog?tag=${blog.tags[0]}`}
              className="text-sm font-semibold uppercase tracking-wide text-accent hover:underline"
            >
              {blog.tags[0]}
            </Link>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            {blog.title}
          </h1>
          {blog.subTitle && (
            <p className="mt-3 text-lg text-foreground-muted">
              {blog.subTitle}
            </p>
          )}

          <div className="mt-6 flex items-center gap-3">
            {blog.author?.image && (
              <Image
                src={blog.author.image}
                alt={blog.author.name || "Author"}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-ink">
                {blog.author?.name || "TechToCheck Team"}
              </p>
              <time className="text-xs text-foreground-muted">
                {new Date(date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </div>
          </div>
        </Reveal>

        {blog.coverImage && (
          <Reveal delay={100}>
            <div className="relative mt-8 aspect-video overflow-hidden rounded-lg">
              <Image
                src={blog.coverImage}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </Reveal>
        )}

        <Reveal delay={150}>
          <div className="mt-10">
            <BlogContentRenderer blocks={blog.content as never} />
          </div>
        </Reveal>

        {blog.tags?.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="rounded-full border border-border px-3 py-1 text-xs text-foreground-muted hover:border-accent hover:text-accent transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {blog.products.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-ink">
              Related Products
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {blog.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 border-t border-border pt-10">
          <BlogComments blogId={blog.id} />
        </div>
      </article>
    </>
  );
}
