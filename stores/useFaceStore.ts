import { create } from 'zustand';
import { faceService as defaultFaceService } from '@/services';
import type { DetectedFaceDto, SearchFacesQuery } from '@/types';
import { createGenericCrudStore, GenericCrudStore } from '@/stores/useGenericCrudStore';

const PAGE_SIZE = 10;

export type FaceStore = GenericCrudStore<DetectedFaceDto, DetectedFaceDto, SearchFacesQuery>;

export const useFaceStore = create<FaceStore>(
  createGenericCrudStore<DetectedFaceDto, DetectedFaceDto, SearchFacesQuery>(
    defaultFaceService,
    PAGE_SIZE
  )
);
