import { ChatUser } from './chat-user';
import { Message } from './message';

export interface Room {
  roomId: string;
  users: ChatUser[];
  messages: Message[];
  isGroup?: boolean;
  groupName?: string;
  createdBy: ChatUser;
}
