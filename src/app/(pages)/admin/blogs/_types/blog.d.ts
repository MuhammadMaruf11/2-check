import { Blog } from "@prisma/client";

export type BlogWithAuthor = Blog & {
  author: {
    name: string | null;
    image: string | null;
  };
};
