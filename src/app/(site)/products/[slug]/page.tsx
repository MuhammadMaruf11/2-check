import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { productService } from "@/services/product.service";
import RatingRing from "@/components/site/RatingRing";
import ProductCard from "@/components/site/ProductCard";
import AffiliateDisclosure from "@/components/site/AffiliateDisclosure";
import Reveal from "@/components/site/Reveal";
import ProductGallery from "./_components/ProductGallery";
import ProductReviews from "./_components/ProductReviews";
import { CheckIcon, CloseIcon, PlayIcon } from "./_components/ProductIcons";

export const revalidate = 60;

interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  brand?: string | null;
  shortDescription: string;
  longDescription: string;
  verdict?: string | null;
  thumbnailUrl?: string | null;
  imageUrls: string[];
  pros: string[];
  cons: string[];
  price?: number | string | { toString(): string } | null;
  originalPrice?: number | string | { toString(): string } | null;
  currency: string;
  rating: number;
  ratingCount: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords: string[];
  category?: { name: string; slug: string } | null;
  specifications: {
    id: string;
    groupName?: string | null;
    label: string;
    value: string;
  }[];
  affiliateLinks: {
    id: string;
    storeName: string;
    affiliateUrl: string;
    price?: number | string | { toString(): string } | null;
    currency: string;
    isActive: boolean;
  }[];
  videoReviews: {
    id: string;
    title: string;
    youtubeUrl: string;
    youtubeId?: string | null;
    thumbnailUrl?: string | null;
    reviewerName?: string | null;
  }[];
  expertReviews: {
    id: string;
    reviewerName: string;
    reviewerRole?: string | null;
    quote: string;
    rating?: number | null;
  }[];
  blogs: { id: string; slug: string; title: string; status: string }[];
  relatedTo: RelatedProduct[];
  relatedFrom: RelatedProduct[];
}

interface RelatedProduct {
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
}

const getProduct = cache(
  (slug: string): Promise<ProductDetail | null> =>
    productService.getBySlug(slug),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  const title = product.seoTitle || `${product.name} Review`;
  const description = product.seoDescription || product.shortDescription;

  return {
    title,
    description,
    keywords: product.seoKeywords,
    openGraph: {
      title,
      description,
      images: product.thumbnailUrl ? [product.thumbnailUrl] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.thumbnailUrl ? [product.thumbnailUrl] : [],
    },
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const price = product.price ? Number(product.price) : null;
  const originalPrice = product.originalPrice
    ? Number(product.originalPrice)
    : null;
  const relatedProducts = [...product.relatedTo, ...product.relatedFrom].slice(
    0,
    4,
  );
  const publishedArticles = product.blogs.filter(
    (b) => b.status === "PUBLISHED",
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.imageUrls?.length
      ? product.imageUrls
      : product.thumbnailUrl
        ? [product.thumbnailUrl]
        : [],
    description: product.shortDescription,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    ...(price
      ? {
          offers: {
            "@type": "Offer",
            price: price.toFixed(2),
            priceCurrency: product.currency,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    ...(product.ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating.toFixed(1),
            reviewCount: product.ratingCount,
          },
        }
      : {}),
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Reviews", item: "/products" },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category.name,
              item: `/products?category=${product.category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 4 : 3,
        name: product.name,
        item: `/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav
          className="mb-6 text-sm text-foreground-muted"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-accent">
            Reviews
          </Link>
          {product.category && (
            <>
              <span className="mx-2">/</span>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-accent"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        {/* Hero */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <Reveal>
            <ProductGallery images={product.imageUrls} name={product.name} />
          </Reveal>

          <Reveal delay={100}>
            <div className="flex flex-col">
              {product.brand && (
                <p className="text-sm font-medium uppercase tracking-wide text-accent">
                  {product.brand}
                </p>
              )}
              <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-3 text-lg text-foreground-muted">
                {product.shortDescription}
              </p>

              <div className="mt-6 flex items-center gap-4">
                <RatingRing rating={product.rating} size="lg" />
                <div>
                  <p className="font-display text-lg font-semibold text-ink">
                    {product.rating > 0
                      ? `${product.rating.toFixed(1)} / 5`
                      : "Not yet rated"}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    Based on {product.ratingCount} customer reviews
                  </p>
                </div>
              </div>

              {price && (
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="font-mono text-3xl font-bold text-ink">
                    {product.currency} {price.toFixed(2)}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="font-mono text-lg text-foreground-muted line-through">
                      {product.currency} {originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              )}

              {product.affiliateLinks.filter((l) => l.isActive).length > 0 && (
                <div className="mt-6">
                  <p className="mb-2 text-sm font-semibold text-ink">
                    Where to Buy
                  </p>
                  <div className="flex flex-col gap-2">
                    {product.affiliateLinks
                      .filter((l) => l.isActive)
                      .map((link) => (
                        <a
                          key={link.id}
                          href={link.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3 transition-colors hover:border-accent"
                        >
                          <span className="font-medium text-ink">
                            {link.storeName}
                          </span>
                          <span className="flex items-center gap-3">
                            {link.price && (
                              <span className="font-mono text-sm text-foreground-muted">
                                {link.currency} {Number(link.price).toFixed(2)}
                              </span>
                            )}
                            <span className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-white">
                              Buy Now
                            </span>
                          </span>
                        </a>
                      ))}
                  </div>
                  <div className="mt-3">
                    <AffiliateDisclosure compact />
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-16">
            {/* Overview */}
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-ink">
                Overview
              </h2>
              <div
                className="mt-4 text-foreground-muted leading-relaxed [&_a]:text-accent [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(product.longDescription),
                }}
              />
            </Reveal>

            {/* Pros & Cons */}
            {(product.pros.length > 0 || product.cons.length > 0) && (
              <Reveal>
                <h2 className="font-display text-2xl font-bold text-ink">
                  Pros & Cons
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-accent-soft p-5">
                    <h3 className="mb-3 font-semibold text-accent-strong">
                      Pros
                    </h3>
                    <ul className="space-y-2">
                      {product.pros.map((pro, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-ink"
                        >
                          <CheckIcon className="mt-0.5 text-accent" /> {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-border bg-rating-soft p-5">
                    <h3 className="mb-3 font-semibold text-danger">Cons</h3>
                    <ul className="space-y-2">
                      {product.cons.map((con, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-ink"
                        >
                          <CloseIcon className="mt-0.5 text-danger" /> {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            )}

            {/* Specifications */}
            {product.specifications.length > 0 && (
              <Reveal>
                <h2 className="font-display text-2xl font-bold text-ink">
                  Specifications
                </h2>
                <div className="mt-4 overflow-hidden rounded-lg border border-border">
                  {Object.entries(
                    product.specifications.reduce<
                      Record<string, typeof product.specifications>
                    >((acc, spec) => {
                      const group = spec.groupName || "General";
                      acc[group] = acc[group] || [];
                      acc[group].push(spec);
                      return acc;
                    }, {}),
                  ).map(([group, specs]) => (
                    <div key={group}>
                      <div className="bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-wide text-accent-strong">
                        {group}
                      </div>
                      {specs.map((spec) => (
                        <div
                          key={spec.id}
                          className="flex justify-between border-t border-border px-4 py-3 text-sm even:bg-background"
                        >
                          <span className="text-foreground-muted">
                            {spec.label}
                          </span>
                          <span className="font-mono text-ink text-right">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Our Verdict */}
            {product.verdict && (
              <Reveal>
                <h2 className="font-display text-2xl font-bold text-ink">
                  Our Verdict
                </h2>
                <blockquote className="mt-4 border-l-4 border-accent bg-accent-soft p-6 text-lg italic leading-relaxed text-ink">
                  {product.verdict}
                </blockquote>
              </Reveal>
            )}

            {/* Video reviews */}
            {product.videoReviews.length > 0 && (
              <Reveal>
                <h2 className="font-display text-2xl font-bold text-ink">
                  Video Reviews
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {product.videoReviews.map((video) => (
                    <div
                      key={video.id}
                      className="overflow-hidden rounded-lg border border-border"
                    >
                      {video.youtubeId ? (
                        <div className="aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${video.youtubeId}`}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full"
                          />
                        </div>
                      ) : (
                        <a
                          href={video.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex aspect-video items-center justify-center bg-ink text-white"
                        >
                          <PlayIcon size={40} />
                        </a>
                      )}
                      <div className="p-3">
                        <p className="font-medium text-ink">{video.title}</p>
                        <p className="text-xs text-foreground-muted">
                          {video.reviewerName || "TechToCheck"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Expert reviews */}
            {product.expertReviews.length > 0 && (
              <Reveal>
                <h2 className="font-display text-2xl font-bold text-ink">
                  Expert Reviews
                </h2>
                <div className="mt-4 space-y-4">
                  {product.expertReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-border bg-surface p-6"
                    >
                      <p className="text-lg italic leading-relaxed text-ink">
                        &ldquo;{review.quote}&rdquo;
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-ink">
                            {review.reviewerName}
                          </p>
                          {review.reviewerRole && (
                            <p className="text-xs text-foreground-muted">
                              {review.reviewerRole}
                            </p>
                          )}
                        </div>
                        {review.rating != null && (
                          <RatingRing rating={review.rating} size="sm" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Customer reviews */}
            <Reveal>
              <ProductReviews productId={product.id} />
            </Reveal>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            {publishedArticles.length > 0 && (
              <Reveal>
                <h3 className="font-display text-lg font-bold text-ink">
                  Related Articles
                </h3>
                <div className="mt-4 space-y-4">
                  {publishedArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/blog/${article.slug}`}
                      className="block group"
                    >
                      <p className="font-medium text-ink group-hover:text-accent transition-colors">
                        {article.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}

            {relatedProducts.length > 0 && (
              <Reveal>
                <h3 className="font-display text-lg font-bold text-ink">
                  Related Products
                </h3>
                <div className="mt-4 space-y-4">
                  {relatedProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      className="block group"
                    >
                      <p className="font-medium text-ink group-hover:text-accent transition-colors">
                        {p.name}
                      </p>
                      {p.category && (
                        <p className="text-xs text-foreground-muted">
                          {p.category.name}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-bold text-ink">
              You Might Also Like
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <ProductCard
                    product={{
                      slug: p.slug,
                      name: p.name,
                      brand: p.brand,
                      thumbnailUrl: p.thumbnailUrl,
                      shortDescription: p.shortDescription,
                      rating: p.rating,
                      ratingCount: p.ratingCount,
                      price: p.price,
                      originalPrice: p.originalPrice,
                      currency: p.currency,
                      category: p.category,
                    }}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
