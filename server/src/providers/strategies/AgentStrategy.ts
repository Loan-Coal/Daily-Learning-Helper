export interface AgentStrategy {
  generateTags(content: string): Promise<string[]>;
}

export class DefaultAgentStrategy implements AgentStrategy {
  async generateTags(content: string): Promise<string[]> {
    // Simple keyword-based tag generation as fallback
    const keywords = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const uniqueKeywords = [...new Set(keywords)];
    return uniqueKeywords.slice(0, 5); // Return top 5 keywords as tags
  }
}