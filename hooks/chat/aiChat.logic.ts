// gia-pha-viet-app/hooks/chat/aiChat.logic.ts
import { IMessage } from '@/types';
import { AIChatServiceAdapter } from './aiChat.adapters';
import { nanoid } from 'nanoid';

// Define the dependencies for the logic module
export interface AIChatLogicDeps {
  aiChatService: AIChatServiceAdapter;

  getTranslation: (key: string, options?: { message: string }) => string;
  sessionId: string; // Add sessionId
  familyId: string; // Add familyId
}

/**
 * Generates an initial message for the AI chat.
 * @param t The translation function.
 * @returns An array containing the initial AI message.
 */
export function generateInitialMessage(t: (key: string) => string): IMessage[] {
  return [
    {
      _id: 1,
      text: t('aiChat.initialMessage'),
      createdAt: new Date(),
      user: {
        _id: "2",
        name: 'AI Assistant',
      },
    },
  ];
}

/**
 * Processes a new user message and generates an AI response.
 * @param userMessages An array of user messages (typically one for the latest message).
 * @param deps Dependencies for AI chat logic.
 * @returns A Promise resolving to the AI's response message.
 */
export async function processUserMessage(
  userMessages: IMessage[],
  deps: AIChatLogicDeps
): Promise<IMessage> {
  const { aiChatService, sessionId, familyId } = deps;
  const userMessage = userMessages[0].text;

  const aiResponseText = await aiChatService.getAIResponse(userMessage, sessionId, familyId);

  return {
    _id: nanoid(),
    text: aiResponseText,
    createdAt: new Date(),
    user: {
      _id: "2",
      name: 'AI Assistant',
    },
  };
}
