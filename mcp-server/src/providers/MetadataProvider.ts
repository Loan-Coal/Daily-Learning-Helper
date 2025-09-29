import { PrismaClient } from '@prisma/client';

export interface DocumentMetadata {
  id: string;
  filename: string;
  originalName: string;
  tags: string[];
  size: number;
  mimeType: string;
  uploadedAt: Date;
  userId: string;
  chunkCount?: number;
  isProcessed: boolean;
}

export class MetadataProvider {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getDocumentMetadata(documentId: string): Promise<DocumentMetadata | null> {
    try {
      const document = await this.prisma.file.findUnique({
        where: { id: documentId },
        include: {
          chunks: {
            select: { id: true }
          }
        }
      });

      if (!document) {
        return null;
      }

      return {
        id: document.id,
        filename: document.filename,
        originalName: document.originalName,
        tags: Array.isArray(document.tags) ? document.tags as string[] : JSON.parse(document.tags || '[]'),
        size: document.size,
        mimeType: document.mimeType,
        uploadedAt: document.uploadedAt,
        userId: document.userId,
        chunkCount: document.chunks?.length || 0,
        isProcessed: document.isProcessed
      };

    } catch (error) {
      console.error('Failed to get document metadata:', error);
      throw error;
    }
  }

  async getUserDocuments(userId: string): Promise<DocumentMetadata[]> {
    try {
      const documents = await this.prisma.file.findMany({
        where: { userId },
        include: {
          chunks: {
            select: { id: true }
          }
        },
        orderBy: { uploadedAt: 'desc' }
      });

      return documents.map((doc: any) => ({
        id: doc.id,
        filename: doc.filename,
        originalName: doc.originalName,
        tags: Array.isArray(doc.tags) ? doc.tags as string[] : JSON.parse(doc.tags || '[]'),
        size: doc.size,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt,
        userId: doc.userId,
        chunkCount: doc.chunks?.length || 0,
        isProcessed: doc.isProcessed
      }));

    } catch (error) {
      console.error('Failed to get user documents:', error);
      throw error;
    }
  }

  async getDocumentsByTags(tags: string[], userId?: string): Promise<DocumentMetadata[]> {
    try {
      // For SQLite, we need to use contains with JSON search
      const whereClause: any = {
        OR: tags.map(tag => ({
          tags: {
            contains: `"${tag}"`  // Search for tag in JSON array string
          }
        }))
      };

      if (userId) {
        whereClause.userId = userId;
      }

      const documents = await this.prisma.file.findMany({
        where: whereClause,
        include: {
          chunks: {
            select: { id: true }
          }
        },
        orderBy: { uploadedAt: 'desc' }
      });

      return documents.map((doc: any) => ({
        id: doc.id,
        filename: doc.filename,
        originalName: doc.originalName,
        tags: Array.isArray(doc.tags) ? doc.tags as string[] : JSON.parse(doc.tags || '[]'),
        size: doc.size,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt,
        userId: doc.userId,
        chunkCount: doc.chunks?.length || 0,
        isProcessed: doc.isProcessed
      }));

    } catch (error) {
      console.error('Failed to get documents by tags:', error);
      throw error;
    }
  }

  async updateDocumentProcessingStatus(
    documentId: string, 
    isProcessed: boolean,
    chunkCount?: number
  ): Promise<void> {
    try {
      await this.prisma.file.update({
        where: { id: documentId },
        data: {
          isProcessed,
          processedAt: isProcessed ? new Date() : null
        }
      });

      console.log(`Updated processing status for document ${documentId}: ${isProcessed}`);
    } catch (error) {
      console.error('Failed to update document processing status:', error);
      throw error;
    }
  }

  async getProcessingStats(): Promise<{
    totalDocuments: number;
    processedDocuments: number;
    pendingDocuments: number;
    totalChunks: number;
  }> {
    try {
      const totalDocuments = await this.prisma.file.count();
      const processedDocuments = await this.prisma.file.count({
        where: { isProcessed: true }
      });
      const totalChunks = await this.prisma.documentChunk.count();

      return {
        totalDocuments,
        processedDocuments,
        pendingDocuments: totalDocuments - processedDocuments,
        totalChunks
      };

    } catch (error) {
      console.error('Failed to get processing stats:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}