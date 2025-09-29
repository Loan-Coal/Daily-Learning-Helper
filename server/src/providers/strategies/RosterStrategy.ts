export interface RosterStrategy {
  matchTags(content: string, roster: string[]): Promise<string[]>;
}

export class DefaultRosterStrategy implements RosterStrategy {
  async matchTags(content: string, roster: string[]): Promise<string[]> {
    const contentLower = content.toLowerCase();
    return roster.filter(tag => 
      contentLower.includes(tag.toLowerCase())
    );
  }
}