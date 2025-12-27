import React, { useState, useEffect, memo } from "react";
import { View, Image } from "react-native";
import { Text } from "react-native-paper";
import FaceBoundingBoxes from "@/components/face/FaceBoundingBoxes";
import { calculateBoundingBox } from "@/utils/faceUtils";
import { FaceDetectionResponseDto } from "@/types";

interface ImageDimensions {
  width: number;
  height: number;
}

interface FaceBoundingBoxItemProps {
  faceDetectionResponse: FaceDetectionResponseDto;
  containerStyle: any; // Style for the container View
}

const FaceBoundingBoxItem: React.FC<FaceBoundingBoxItemProps> = memo(
  ({ faceDetectionResponse, containerStyle }) => {
    console.log(
      "FaceBoundingBoxItem: Received faceDetectionResponse",
      faceDetectionResponse
    );
    const [imageDimensions, setImageDimensions] =
      useState<ImageDimensions | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Add loading state

    useEffect(() => {
      if (faceDetectionResponse.originalImageUrl) {
        setIsLoading(true); // Start loading
        console.log(
          "FaceBoundingBoxItem: Fetching image size for",
          faceDetectionResponse.originalImageUrl
        );
        Image.getSize(
          faceDetectionResponse.originalImageUrl,
          (width, height) => {
            setImageDimensions({ width, height });
            setIsLoading(false); // End loading on success
            console.log(
              "FaceBoundingBoxItem: Image dimensions fetched successfully",
              { width, height }
            );
          },
          (error) => {
            console.error(
              "FaceBoundingBoxItem: Failed to get image size:",
              error
            );
            setImageDimensions({ width: 1, height: 1 }); // Fallback
            setIsLoading(false); // End loading on error
          }
        );
      } else {
        setIsLoading(false); // No image URL, so not loading
        console.warn("FaceBoundingBoxItem: No originalImageUrl provided.");
      }
    }, [faceDetectionResponse.originalImageUrl]);

    if (!faceDetectionResponse.originalImageUrl) {
      console.log(
        "FaceBoundingBoxItem: originalImageUrl is null, returning null."
      );
      return null;
    }

    console.log(
      "FaceBoundingBoxItem: Render check - isLoading:",
      isLoading,
      "imageDimensions:",
      imageDimensions
    );
    if (isLoading || !imageDimensions) {
      // Return a loading indicator or placeholder while dimensions are being fetched
      return (
        <View style={containerStyle}>
          <Text style={{ textAlign: "center" }}>Loading image...</Text>
        </View>
      );
    }

    return (
      <View style={containerStyle}>
        {faceDetectionResponse.detectedFaces.length > 0 && (
          <FaceBoundingBoxes
            image={faceDetectionResponse.originalImageUrl}
            imageDimensions={imageDimensions}
            detectedFaces={faceDetectionResponse.detectedFaces}
            calculateBoundingBox={calculateBoundingBox}
            showLabels={true}
            onPressFace={undefined}
          />
        )}
      </View>
    );
  }
);

FaceBoundingBoxItem.displayName = "FaceBoundingBoxItem";

export default FaceBoundingBoxItem;
