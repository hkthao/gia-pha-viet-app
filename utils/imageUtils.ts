import { ImageSourcePropType } from 'react-native';

const defaultUserAvatar = require('@/assets/images/familyAvatar.png'); // Using familyAvatar for generic user
const defaultAIAvatar = require('@/assets/images/ai-avatar.png'); // Placeholder for AI robot icon

export const getMemberAvatarSource = (avatarUrl?: string | null): ImageSourcePropType => {
  if (avatarUrl) {
    return { uri: avatarUrl };
  }
  return defaultUserAvatar;
};

export const getAIAvatarSource = (): ImageSourcePropType => {
  return defaultAIAvatar;
};

export const base64ToImageSource = (base64String?: string | null, mimeType: string = 'image/jpeg'): ImageSourcePropType | undefined => {
  if (base64String) {
    // Check if the base64 string already has a data URL prefix
    if (base64String.startsWith('data:')) {
      return { uri: base64String };
    }
    return { uri: `data:${mimeType};base64,${base64String}` };
  }
  return undefined;
};
