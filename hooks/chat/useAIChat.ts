// gia-pha-viet-app/hooks/chat/useAIChat.ts

import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { generateInitialMessage, processUserMessage } from './aiChat.logic';
import { defaultAIChatServiceAdapter, AIChatServiceAdapter } from './aiChat.adapters';
import { nanoid } from 'nanoid';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore';
import { IMessage, ChatAttachmentDto } from '@/types';

// Define the dependencies for the hook
export interface UseAIChatDeps {
  aiChatService?: AIChatServiceAdapter;

}

const defaultDeps: UseAIChatDeps = {
  aiChatService: defaultAIChatServiceAdapter,
  };

export function useAIChat(deps: UseAIChatDeps = defaultDeps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<IMessage[]>(() => generateInitialMessage(t));
  const { aiChatService } = { ...defaultDeps, ...deps };

  // Generate a session ID once per component mount
  const sessionIdRef = useRef(nanoid());
  const sessionId = sessionIdRef.current;

  // Get current family ID from store
  const { currentFamilyId } = useCurrentFamilyStore();
  const familyId = currentFamilyId || 'default_family_id'; // Fallback to a default or handle appropriately

  const onSend = useCallback(async (newMessages: IMessage[] = [], attachments?: ChatAttachmentDto[]) => {
    // R3. Side-effects phải nằm trong `actions`
    setMessages(previousMessages =>
      [...previousMessages, ...newMessages]
    );

    const userMessage = newMessages[0];
    if (userMessage) {
      try {
        const aiResponse = await processUserMessage([userMessage], {
          aiChatService: aiChatService!, // Use the destructured aiChatService
          getTranslation: t,
          sessionId: sessionId,
          familyId: familyId,
          attachments: attachments, // Pass attachments here
        });
        setMessages(previousMessages => [...previousMessages, aiResponse]);
      } catch (error) {
        console.error("AI Chat Error:", error);
        // Handle error, e.g., show an error message
        const errorMessage: IMessage = {
            _id: Math.round(Math.random() * 1000000).toString(), // Ensure _id is a string
            text: (error as Error).message || t('aiChat.errorMessage'), // Use the specific error message
            createdAt: new Date(),
            user: {
              _id: '2', // Ensure _id is a string
              name: 'AI Assistant',
            },
          };
          setMessages(previousMessages => [...previousMessages, errorMessage]);
      }
    }
  }, [aiChatService, t, sessionId, familyId]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const sendAIMessage = useCallback(async () => {
    // This could be more sophisticated, e.g., call a dedicated AI endpoint
    // or generate a new message directly.
    // For now, let's simulate by calling processUserMessage with an empty/initial prompt
    // to get an AI response.
    try {
      const aiResponse = await processUserMessage([{
        _id: 'system-ai-prompt', // Ensure _id is a string
        text: 'AI initiated conversation', // A hidden message to trigger AI
        createdAt: new Date(),
        user: { _id: '1', name: 'System' }, // From system, ensure _id is a string
      }], {
        aiChatService: aiChatService!,
        getTranslation: t,
        sessionId: sessionId,
        familyId: familyId,
      });
      setMessages(previousMessages => [...previousMessages, aiResponse]);
    } catch (error) {
      console.error("AI Initiated Chat Error:", error);
      const errorMessage: IMessage = {
          _id: Math.round(Math.random() * 1000000).toString(), // Ensure _id is a string
          text: (error as Error).message || t('aiChat.errorMessage'), // Use the specific error message
          createdAt: new Date(),
          user: {
            _id: '2', // Ensure _id is a string
            name: 'AI Assistant',
            avatar: 'https://placeimg.com/140/140/any',
          },
        };
        setMessages(previousMessages => [...previousMessages, errorMessage]);
    }
  }, [aiChatService, t, sessionId, familyId]);

  // R8. Không return state rời rạc
  return {
    state: {
      messages,
    },
    actions: {
      onSend,
      clearChat,
      sendAIMessage,
    },
  };
}
