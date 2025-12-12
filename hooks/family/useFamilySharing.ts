import { useCallback, useMemo } from 'react';
import { Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCurrentFamilyId } from './useCurrentFamilyId';

export interface UseFamilySharingResult {
  familyDetailUrl: string;
  onShare: () => Promise<void>;
}

export function useFamilySharing(): UseFamilySharingResult {
  const { t } = useTranslation();
  const currentFamilyId = useCurrentFamilyId();

  const familyDetailUrl = useMemo(() => {
    const baseUrl = process.env.EXPO_PUBLIC_APP_BASE_URL;
    if (!baseUrl) {
      console.warn('EXPO_PUBLIC_APP_BASE_URL is not defined. Sharing functionality might not work.');
      return '';
    }
    return currentFamilyId ? `${baseUrl}/public/family-tree/${currentFamilyId}` : '';
  }, [currentFamilyId]);

  const onShare = useCallback(async () => {
    if (!familyDetailUrl) {
      console.warn('Cannot share: familyDetailUrl is empty.');
      return;
    }
    try {
      const result = await Share.share({
        message: t('familyTree.shareMessage', { url: familyDetailUrl }),
        url: familyDetailUrl,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error: any) {
      console.error('Error sharing:', error.message);
    }
  }, [familyDetailUrl, t]);

  return { familyDetailUrl, onShare };
}