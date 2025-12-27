// gia-pha-viet-app/hooks/chat/aiChat.logic.ts
import { IMessage, ChatInputRequest, ChatAttachmentDto, ChatLocationDto } from '@/types'; 
import { AIChatServiceAdapter } from './aiChat.adapters';
import { nanoid } from 'nanoid';

// Define the dependencies for the logic module
export interface AIChatLogicDeps {
  aiChatService: AIChatServiceAdapter;

  getTranslation: (key: string, options?: { message: string }) => string;
  sessionId: string; // Add sessionId
  familyId: string; // Add familyId
  attachments?: ChatAttachmentDto[]; // Change to ChatAttachmentDto[]
  location?: ChatLocationDto | null; // Add location here
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
  const { aiChatService, sessionId, familyId, attachments, location } = deps;
  const userMessage = userMessages[0].text;

  const request: ChatInputRequest = {
    sessionId: sessionId,
    familyId: familyId,
    chatInput: userMessage,
    metadata: {}, // Placeholder
    attachments: attachments || [], // Use passed attachments
    location: location ?? undefined, // Convert null to undefined for ChatInputRequest
  };
  const aiResponse = await aiChatService.sendMessage(request);
  const aiResponseText = aiResponse.output || '';

    const messageFaceDetectionResults = aiResponse.faceDetectionResults && aiResponse.faceDetectionResults.length > 0 && attachments && attachments.length > 0
      ? [
          {
            imageId: nanoid(), // Generate a unique ID for the image
            originalImageUrl: attachments[0].url,
            detectedFaces: [...aiResponse.faceDetectionResults], // Create a new array instance to ensure re-render
          },
        ]
      : undefined;

  return {
    _id: nanoid(),
    text: aiResponseText,
    createdAt: new Date(),
    user: {
      _id: "2",
      name: 'AI Assistant',
    },
    generatedData: aiResponse.generatedData,
    intent: aiResponse.intent,
    faceDetectionResults: messageFaceDetectionResults,
  };
}
