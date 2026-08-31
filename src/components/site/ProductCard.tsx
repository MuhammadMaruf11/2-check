import Link from "next/link";
import Image from "next/image";
import RatingRing from "./RatingRing";

export interface ProductCardData {
  slug: string;
  name: string;
  brand?: string | null;
  thumbnailUrl?: string | null;
  shortDescription: string;
  rating: number;
  ratingCount: number;
  // Accepts number/string (JSON-serialized) as well as Prisma's Decimal (passed directly
  // from a Server Component without crossing a client-boundary JSON round trip).
  price?: number | string | { toString(): string } | null;
  originalPrice?: number | string | { toString(): string } | null;
  currency: string;
  category?: { name: string; slug: string } | null;
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const price = product.price ? Number(product.price) : null;
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
  const onSale = price && originalPrice && originalPrice > price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-accent-soft">
        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-accent/40 font-display text-3xl">
            {product.name.charAt(0)}
          </div>
        )}
        {product.category && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {product.category.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            {product.brand && <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">{product.brand}</p>}
            <h3 className="font-display font-semibold leading-snug text-ink group-hover:text-accent transition-colors">
              {product.name}
            </h3>
          </div>
          <RatingRing rating={product.rating} size="sm" />
        </div>
        <p className="line-clamp-2 text-sm text-foreground-muted">{product.shortDescription}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          {price ? (
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-base font-semibold text-ink">
                {product.currency} {price.toFixed(2)}
              </span>
              {onSale && (
                <span className="font-mono text-xs text-foreground-muted line-through">
                  {product.currency} {originalPrice!.toFixed(2)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-foreground-muted">See pricing</span>
          )}
          <span className="text-xs text-foreground-muted">{product.ratingCount} reviews</span>
        </div>
      </div>
    </Link>
  );
}
