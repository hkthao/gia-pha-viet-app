import React, { memo } from "react";
import { IMessage } from "@/types";
import AIChatMessageBubble from './AIChatMessageBubble';
import UserChatMessageBubble from './UserChatMessageBubble';

interface ChatMessageBubbleProps {
  item: IMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = memo(({ item }) => {
  // Assuming '1' is the _id for the current user, '2' for AI Assistant
  const isMyMessage = item.user._id === "1"; 

  if (isMyMessage) {
    return <UserChatMessageBubble item={item} />;
  } else {
    return <AIChatMessageBubble item={item} />;
  }
});

ChatMessageBubble.displayName = 'ChatMessageBubble';

export default ChatMessageBubble;
