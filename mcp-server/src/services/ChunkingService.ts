export interface TextChunk {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  chunkIndex: number;
  metadata: Record<string, any>;
}

export class ChunkingService {
  private chunkSize: number;
  private overlapSize: number;

  constructor() {
    this.chunkSize = parseInt(process.env.CHUNK_SIZE || '1500');
    this.overlapSize = parseInt(process.env.CHUNK_OVERLAP || '200');
  }

  chunkText(
    text: string, 
    fileId: string, 
    metadata: Record<string, any> = {}
  ): TextChunk[] {
    if (!text || text.length === 0) {
      return [];
    }

    const chunks: TextChunk[] = [];
    let currentPosition = 0;
    let chunkIndex = 0;

    while (currentPosition < text.length) {
      const endPosition = Math.min(
        currentPosition + this.chunkSize,
        text.length
      );

      // Try to find a natural break point (sentence ending, paragraph break)
      let actualEndPosition = endPosition;
      
      if (endPosition < text.length) {
        // Look for sentence endings within the last 200 characters
        const searchStart = Math.max(endPosition - 200, currentPosition);
        const searchText = text.substring(searchStart, endPosition + 100);
        
        const sentenceEndings = /[.!?]\s+/g;
        let lastMatch = -1;
        let match;
        
        while ((match = sentenceEndings.exec(searchText)) !== null) {
          lastMatch = match.index + match[0].length;
        }
        
        if (lastMatch > -1) {
          actualEndPosition = searchStart + lastMatch;
        }
      }

      const chunkContent = text.substring(currentPosition, actualEndPosition);
      
      if (chunkContent.trim().length > 0) {
        chunks.push({
          id: `${fileId}_chunk_${chunkIndex}`,
          content: chunkContent.trim(),
          startIndex: currentPosition,
          endIndex: actualEndPosition,
          chunkIndex,
          metadata: {
            ...metadata,
            fileId,
            chunkSize: actualEndPosition - currentPosition,
            totalChunks: 0 // Will be updated after all chunks are created
          }
        });
        chunkIndex++;
      }

      // Move to next position with overlap
      currentPosition = actualEndPosition - this.overlapSize;
      
      // Ensure we make progress
      if (currentPosition >= actualEndPosition - 50) {
        currentPosition = actualEndPosition;
      }
    }

    // Update total chunks count in metadata
    chunks.forEach(chunk => {
      chunk.metadata.totalChunks = chunks.length;
    });

    console.log(`Created ${chunks.length} chunks from text of ${text.length} characters`);
    return chunks;
  }

  extractTextFromPDF(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      // For now, return a placeholder. In real implementation, use pdf-parse
      resolve('PDF text extraction not yet implemented');
    });
  }

  extractTextFromWord(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      // For now, return a placeholder. In real implementation, use mammoth
      resolve('Word text extraction not yet implemented');
    });
  }

  async extractTextFromFile(
    buffer: Buffer, 
    mimeType: string, 
    filename: string
  ): Promise<string> {
    try {
      switch (mimeType) {
        case 'application/pdf':
          return await this.extractTextFromPDF(buffer);
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          return await this.extractTextFromWord(buffer);
        
        case 'text/plain':
          return buffer.toString('utf-8');
        
        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      console.error(`Failed to extract text from ${filename}:`, error);
      throw error;
    }
  }

  getChunkingConfig() {
    return {
      chunkSize: this.chunkSize,
      overlapSize: this.overlapSize
    };
  }
}