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
