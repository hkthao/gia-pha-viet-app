// gia-pha-viet-app/hooks/chat/useAIChat.ts

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { IMessage, GiftedChat } from 'react-native-gifted-chat';
import { useTranslation } from 'react-i18next';
import { generateInitialMessage, processUserMessage, AIChatLogicDeps } from './aiChat.logic';
import { defaultAIChatServiceAdapter, AIChatServiceAdapter } from './aiChat.adapters';
import { nanoid } from 'nanoid';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore';

// Define the dependencies for the hook
export interface UseAIChatDeps {
  aiChatService?: AIChatServiceAdapter;

}

const defaultDeps: UseAIChatDeps = {
  aiChatService: defaultAIChatServiceAdapter,
  };

export function useAIChat(deps: UseAIChatDeps = defaultDeps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { aiChatService } = { ...defaultDeps, ...deps };

  // Generate a session ID once per component mount
  const sessionIdRef = useRef(nanoid());
  const sessionId = sessionIdRef.current;

  // Get current family ID from store
  const { currentFamilyId } = useCurrentFamilyStore();
  const familyId = currentFamilyId || 'default_family_id'; // Fallback to a default or handle appropriately

  const aiChatLogicDeps: AIChatLogicDeps = useMemo(() => ({
    aiChatService: aiChatService!, // Asserting non-null as defaults are provided

    getTranslation: t,
    sessionId: sessionId,
    familyId: familyId,
  }), [aiChatService, t, sessionId, familyId]);

  useEffect(() => {
    // R4. Không để logic quan trọng trong `useEffect` -> use init function if complex
    setMessages(generateInitialMessage(t));
  }, [t]);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    // R3. Side-effects phải nằm trong `actions`
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages)
    );

    const userMessage = newMessages[0];
    if (userMessage) {
      try {
        const aiResponse = await processUserMessage([userMessage], aiChatLogicDeps);
        setMessages(previousMessages => GiftedChat.append(previousMessages, [aiResponse]));
      } catch (error) {
        console.error("AI Chat Error:", error);
        // Handle error, e.g., show an error message
        const errorMessage: IMessage = {
            _id: Math.round(Math.random() * 1000000),
            text: t('aiChat.errorMessage'), // Need to add this translation key
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'AI Assistant',
              avatar: 'https://placeimg.com/140/140/any',
            },
          };
          setMessages(previousMessages => GiftedChat.append(previousMessages, [errorMessage]));
      }
    }
  }, [aiChatLogicDeps, t]);

  // R8. Không return state rời rạc
  return {
    state: {
      messages,
    },
    actions: {
      onSend,
    },
  };
}
