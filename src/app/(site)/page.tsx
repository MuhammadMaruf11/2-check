import Link from "next/link";
import Image from "next/image";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { blogService } from "@/services/blog.service";
import { reviewService } from "@/services/review.service";
import ProductCard from "@/components/site/ProductCard";
import ArticleCard from "@/components/site/ArticleCard";
import RatingRing from "@/components/site/RatingRing";
import NewsletterForm from "@/components/site/NewsletterForm";
import Reveal from "@/components/site/Reveal";
import { ArrowIcon, PlayIcon } from "@/components/common/PlayIcon";

export const revalidate = 60;

interface HomeProduct {
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
interface HomeArticle {
  id: string;
  slug: string;
  title: string;
  subTitle?: string | null;
  coverImage?: string | null;
  tags: string[];
  publishedAt?: string | Date | null;
  createdAt: string | Date;
  author?: { name?: string | null; image?: string | null } | null;
}
interface HomeVideo {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  product: { name: string; slug: string };
}
interface HomeCategory {
  id: string;
  slug: string;
  name: string;
  _count: { products: number };
}
interface HomeReview {
  id: string;
  rating: number;
  comment: string;
  user: { name?: string | null };
  product: { name: string; slug: string };
}

export default async function HomePage() {
  const [featured, trending, categories, articles, videos, readerReviews]: [
    HomeProduct[],
    HomeProduct[],
    HomeCategory[],
    HomeArticle[],
    HomeVideo[],
    HomeReview[],
  ] = await Promise.all([
    productService.getFeatured(5),
    productService.getTrending(8),
    categoryService.getAllWithPublishedProducts(),
    blogService.getPublished(6),
    productService.getFeaturedVideos(3),
    reviewService.getFeaturedAcrossProducts(4),
  ]);

  const heroProduct = featured[0];
  const editorsPicks = featured.slice(1, 5);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">Independent Tech Reviews</p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
              We test. We compare.
              <br />
              You decide.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-foreground-muted">
              Technology worth your attention — honest verdicts, hands-on testing, and buying guides for a
              global audience, with no sponsored bias.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-md bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-ink-soft transition-colors"
              >
                Browse Reviews
              </Link>
              <Link
                href="/blog"
                className="rounded-md border border-ink px-6 py-3 text-sm font-medium text-ink hover:bg-ink hover:text-white transition-colors"
              >
                Read Articles
              </Link>
            </div>
          </Reveal>

          {heroProduct && (
            <Reveal delay={150}>
              <Link
                href={`/products/${heroProduct.slug}`}
                className="group relative block overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-accent-soft">
                  {heroProduct.thumbnailUrl && (
                    <Image
                      src={heroProduct.thumbnailUrl}
                      alt={heroProduct.name}
                      fill
                      priority
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1 text-xs font-medium text-white">
                    Editor&apos;s Pick
                  </span>
                </div>
                <div className="flex items-center justify-between p-6">
                  <div>
                    {heroProduct.brand && <p className="text-xs uppercase tracking-wide text-foreground-muted">{heroProduct.brand}</p>}
                    <h2 className="font-display text-xl font-semibold text-ink group-hover:text-accent transition-colors">
                      {heroProduct.name}
                    </h2>
                    <p className="mt-1 line-clamp-1 text-sm text-foreground-muted">{heroProduct.shortDescription}</p>
                  </div>
                  <RatingRing rating={heroProduct.rating} />
                </div>
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      {/* Trending Products */}
      {trending.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">Trending Now</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-ink">Most Talked-About Products</h2>
            </div>
            <Link href="/products?sort=rating" className="hidden items-center gap-1 text-sm font-medium text-accent hover:underline sm:flex">
              View all <ArrowIcon />
            </Link>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((product, i) => (
              <Reveal key={product.id} delay={i * 60}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Editor's Picks */}
      {editorsPicks.length > 0 && (
        <section className="bg-ink py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">Editor&apos;s Picks</p>
              <h2 className="mt-1 font-display text-3xl font-bold">Featured This Month</h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {editorsPicks.map((product, i) => (
                <Reveal key={product.id} delay={i * 60}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="group block overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-colors hover:border-accent"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {product.thumbnailUrl && (
                        <Image
                          src={product.thumbnailUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-medium group-hover:text-accent transition-colors">{product.name}</p>
                      <p className="mt-1 text-sm text-white/50">{product.brand}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      {articles.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">From the Blog</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-ink">Latest Articles</h2>
            </div>
            <Link href="/blog" className="hidden items-center gap-1 text-sm font-medium text-accent hover:underline sm:flex">
              View all <ArrowIcon />
            </Link>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, i) => (
              <Reveal key={article.id} delay={i * 60}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Video Reviews */}
      {videos.length > 0 && (
        <section className="bg-accent-soft py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent-strong">Watch</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-ink">Video Reviews</h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {videos.map((video, i) => (
                <Reveal key={video.id} delay={i * 60}>
                  <Link href={`/products/${video.product.slug}`} className="group block overflow-hidden rounded-lg border border-border bg-surface">
                    <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-ink">
                      {video.thumbnailUrl ? (
                        <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                      ) : null}
                      <PlayIcon className="relative z-10 text-white" style={{ fontSize: 40 }} />
                    </div>
                    <div className="p-4">
                      <p className="font-medium text-ink group-hover:text-accent transition-colors line-clamp-1">{video.title}</p>
                      <p className="mt-1 text-xs text-foreground-muted">{video.product.name}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">Browse</p>
            <h2 className="mt-1 font-display text-3xl font-bold text-ink">Popular Categories</h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category, i) => (
              <Reveal key={category.id} delay={i * 40}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-8 text-center transition-colors hover:border-accent hover:bg-accent-soft"
                >
                  <span className="font-display font-semibold text-ink group-hover:text-accent-strong transition-colors">
                    {category.name}
                  </span>
                  <span className="text-xs text-foreground-muted">{category._count.products} reviews</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Reader Reviews */}
      {readerReviews.length > 0 && (
        <section className="border-y border-border bg-paper py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">Reader Reviews</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-ink">What Our Readers Say</h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {readerReviews.map((review, i) => (
                <Reveal key={review.id} delay={i * 60}>
                  <div className="rounded-lg border border-border bg-surface p-6">
                    <p className="text-ink italic leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-ink">{review.user.name || "Verified Reader"}</p>
                        <Link href={`/products/${review.product.slug}`} className="text-xs text-accent hover:underline">
                          {review.product.name}
                        </Link>
                      </div>
                      <RatingRing rating={review.rating} size="sm" max={5} />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col items-center rounded-xl bg-ink px-6 py-14 text-center text-white sm:px-16">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Get our weekly verdict</h2>
          <p className="mt-3 max-w-md text-white/70">
            The best reviews, biggest comparisons, and sharpest buying guides — straight to your inbox, once a
            week, no spam.
          </p>
          <div className="mt-8 flex justify-center">
            <NewsletterForm dark />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
