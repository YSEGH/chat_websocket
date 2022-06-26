export interface ChatUser {
  id: string;
  name: string;
  job: string;
  socketId?: string;
  selected?: boolean;
  disabled?: boolean;
}
