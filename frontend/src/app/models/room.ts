import { ChatUser } from './chat-user';
import { Message } from './message';

export interface Room {
  roomId: string;
  users: {
    currentUser: ChatUser;
    selectedUser: ChatUser;
  };
  messages: Message[];
}
