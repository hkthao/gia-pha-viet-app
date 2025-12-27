// gia-pha-viet-app/utils/faceUtils.ts

import { DetectedFaceDto } from '@/types'; // Import DetectedFaceDto (assuming it's in '@/types' which then exports from types/face.d.ts)

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface BoundingBoxCalculation {
  scaledX: number;
  scaledY: number;
  scaledWidth: number;
  scaledHeight: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Calculates the scaled bounding box coordinates for a detected face
 * based on the image's original dimensions and its container's rendered dimensions.
 * This is crucial for correctly overlaying bounding boxes on images displayed with 'contain' resizeMode.
 * @param face The detected face object containing original bounding box coordinates.
 * @param containerDimensions The dimensions (width, height) of the image's display container.
 * @param currentImageDimensions The original dimensions (width, height) of the image.
 * @returns A BoundingBoxCalculation object with scaled coordinates and offsets, or null if input is invalid.
 */
export const calculateBoundingBox = (
  face: DetectedFaceDto,
  containerDimensions: ImageDimensions,
  currentImageDimensions: ImageDimensions
): BoundingBoxCalculation | null => {
  if (!currentImageDimensions || !containerDimensions || !face.boundingBox) {
    return null;
  }

  const imageAspectRatio = currentImageDimensions.width / currentImageDimensions.height;
  const containerAspectRatio = containerDimensions.width / containerDimensions.height;

  let actualImageRenderedWidth = 0;
  let actualImageRenderedHeight = 0;
  let offsetX = 0;
  let offsetY = 0;

  // Determine the actual rendered size of the image within its container
  // when resizeMode is 'contain'
  if (imageAspectRatio > containerAspectRatio) {
    actualImageRenderedWidth = containerDimensions.width;
    actualImageRenderedHeight = containerDimensions.width / imageAspectRatio;
    offsetY = (containerDimensions.height - actualImageRenderedHeight) / 2;
  } else {
    actualImageRenderedHeight = containerDimensions.height;
    actualImageRenderedWidth = containerDimensions.height * imageAspectRatio;
    offsetX = (containerDimensions.width - actualImageRenderedWidth) / 2;
  }

  const scaleX = actualImageRenderedWidth / currentImageDimensions.width;
  const scaleY = actualImageRenderedHeight / currentImageDimensions.height;

  const box = face.boundingBox;

  const scaledX = box.x * scaleX;
  const scaledY = box.y * scaleY;
  const scaledWidth = box.width * scaleX;
  const scaledHeight = box.height * scaleY;

  const finalX = scaledX + offsetX;
  const finalY = scaledY + offsetY;

  return {
    scaledX: parseFloat(finalX.toFixed(2)),
    scaledY: parseFloat(finalY.toFixed(2)),
    scaledWidth: parseFloat(scaledWidth.toFixed(2)),
    scaledHeight: parseFloat(scaledHeight.toFixed(2)),
    offsetX,
    offsetY,
  };
};
