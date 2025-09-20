/**
 * Tag model interface (matches Prisma schema)
 */
export interface Tag {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}
