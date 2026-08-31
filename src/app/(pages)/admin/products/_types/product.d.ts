export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface ProductSpecificationItem {
  id?: string;
  groupName?: string | null;
  label: string;
  value: string;
  displayOrder: number;
}

export interface AffiliateLinkItem {
  id: string;
  storeName: string;
  storeLogo?: string | null;
  productUrl?: string | null;
  affiliateUrl: string;
  price?: number | string | null;
  currency: string;
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "LIMITED_STOCK" | "PREORDER" | "DISCONTINUED";
  isActive: boolean;
  displayOrder: number;
  trackingId?: string | null;
}

export interface VideoReviewItem {
  id: string;
  title: string;
  youtubeUrl: string;
  youtubeId?: string | null;
  reviewerName?: string | null;
  reviewerChannelUrl?: string | null;
  isFeatured: boolean;
  displayOrder: number;
}

export interface ExpertReviewItem {
  id: string;
  reviewerName: string;
  reviewerRole?: string | null;
  reviewerAvatar?: string | null;
  quote: string;
  sourceUrl?: string | null;
  rating?: number | null;
  isFeatured: boolean;
  displayOrder: number;
}

export interface CustomerReviewItem {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isFeatured: boolean;
  isVerified: boolean;
  createdAt: string;
  user: { name?: string | null; image?: string | null };
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  brand?: string | null;
  categoryId?: string | null;
  category?: CategoryOption | null;
  shortDescription: string;
  longDescription: string;
  verdict?: string | null;
  thumbnailUrl?: string | null;
  imageUrls: string[];
  pros: string[];
  cons: string[];
  specifications: ProductSpecificationItem[];
  rating: number;
  ratingCount: number;
  price?: number | string | null;
  originalPrice?: number | string | null;
  currency: string;
  releaseDate?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords: string[];
  affiliateLinks: AffiliateLinkItem[];
  videoReviews: VideoReviewItem[];
  expertReviews: ExpertReviewItem[];
  customerReviews: CustomerReviewItem[];
  relatedTo: { id: string; name: string; slug: string }[];
  createdAt: string;
  updatedAt: string;
}
