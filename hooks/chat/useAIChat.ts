// gia-pha-viet-app/hooks/chat/useAIChat.ts

import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { generateInitialMessage, processUserMessage } from './aiChat.logic';
import { defaultAIChatServiceAdapter, AIChatServiceAdapter } from './aiChat.adapters';
import { nanoid } from 'nanoid';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore';
import { IMessage } from '@/types';

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
  const [isLoadingAIResponse, setIsLoadingAIResponse] = useState(false); // New state for AI loading
  const { aiChatService } = { ...defaultDeps, ...deps };

  // Generate a session ID once per component mount
  const sessionIdRef = useRef(nanoid());
  const sessionId = sessionIdRef.current;

  // Get current family ID from store
  const { currentFamilyId } = useCurrentFamilyStore();
  const familyId = currentFamilyId || 'default_family_id'; // Fallback to a default or handle appropriately

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    // R3. Side-effects phải nằm trong `actions`
    setMessages(previousMessages =>
      [...previousMessages, ...newMessages]
    );

    const userMessage = newMessages[0];
    if (userMessage) {
      setIsLoadingAIResponse(true); // Start loading
      try {
        const aiResponse = await processUserMessage([userMessage], {
          aiChatService: aiChatService!, // Use the destructured aiChatService
          getTranslation: t,
          sessionId: sessionId,
          familyId: familyId,
          attachments: userMessage.attachments, // Pass attachments from userMessage
          location: userMessage.location, // Pass location from userMessage
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
      } finally {
        setIsLoadingAIResponse(false); // End loading
      }
    }
  }, [aiChatService, t, sessionId, familyId]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  // R8. Không return state rời rạc
  return {
    state: {
      messages,
      isLoadingAIResponse, // Expose loading state
    },
    actions: {
      onSend,
      clearChat,
      // sendAIMessage, // Removed
    },
  };
}
