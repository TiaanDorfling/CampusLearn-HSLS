export type Sender = 'user' | 'bot';

export interface Message {
  text: string;
  sender: Sender;
  suggestedReplies?: string[];
  file?: {
    name: string;
    type: string;
  };
}