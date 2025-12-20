// gia-pha-viet-app/types/chat.d.ts

interface IUser {
  _id: string | number;
  name?: string;
  avatar?: string | number | any;
}

export interface IMessage {
  _id: string | number;
  text: string;
  createdAt: Date | number;
  user: IUser;
  image?: string;
  video?: string;
  audio?: string;
  system?: boolean;
  sent?: boolean;
  received?: boolean;
  pending?: boolean;
  quickReplies?: any;
}
