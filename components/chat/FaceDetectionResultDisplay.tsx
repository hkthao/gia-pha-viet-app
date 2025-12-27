import React, { useState, useEffect, useMemo } from "react";
import { View, Image, ActivityIndicator, StyleSheet } from "react-native";
import { FaceDetectionResponseDto, DetectedFaceDto } from "@/types/face"; // Import specific types
import { FaceBoundingBoxes } from "@/components/face";
import { calculateBoundingBox } from "@/utils/faceUtils";
import { useTheme, Text, List, Avatar, Divider } from "react-native-paper"; // Import Divider
import { SPACING_SMALL } from "@/constants/dimensions";
import { base64ToImageSource } from "@/utils/imageUtils"; // Import the new utility

interface FaceDetectionResultDisplayProps {
  faceDetectionResponse: FaceDetectionResponseDto;
}

const FaceDetectionResultDisplay: React.FC<FaceDetectionResultDisplayProps> = ({
  faceDetectionResponse,
}) => {
  const theme = useTheme();
  const [imageDims, setImageDims] = useState<
    { width: number; height: number } | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { originalImageUrl } = faceDetectionResponse;
  const backendImageWidth = faceDetectionResponse.imageWidth;
  const backendImageHeight = faceDetectionResponse.imageHeight;

  // Assume that faceDetectionResponse.detectedFaces is Array<{ detectedFaces: DetectedFaceDto[] }>
  // and we need to flatten it, or take the first element's detectedFaces property
  const allDetectedFaces: DetectedFaceDto[] = useMemo(() => {
    if (
      faceDetectionResponse.detectedFaces &&
      faceDetectionResponse.detectedFaces.length > 0
    ) {
      // If faceDetectionResponse.detectedFaces[0] is of type { detectedFaces: DetectedFaceDto[] }
      const firstEntry = faceDetectionResponse.detectedFaces[0];
      if (
        (firstEntry as any).detectedFaces &&
        Array.isArray((firstEntry as any).detectedFaces)
      ) {
        return (firstEntry as any).detectedFaces;
      }
      // Else, assume faceDetectionResponse.detectedFaces is directly DetectedFaceDto[] (original assumption)
      return faceDetectionResponse.detectedFaces;
    }
    return [];
  }, [faceDetectionResponse.detectedFaces]);

  useEffect(() => {
    if (!originalImageUrl) {
      setError("Image URL is missing.");
      setLoading(false);
      return;
    }

    // Prioritize dimensions from backend if available
    if (backendImageWidth && backendImageHeight) {
      setImageDims({ width: backendImageWidth, height: backendImageHeight });
      setLoading(false);
      return;
    }

    // Fetch dimensions from image if not provided by backend
    Image.getSize(
      originalImageUrl,
      (width, height) => {
        setImageDims({ width, height });
        setLoading(false);
      },
      (err) => {
        console.error(
          "Failed to get image size for FaceDetectionResultDisplay:",
          err
        );
        setError("Failed to load image dimensions.");
        setLoading(false);
      }
    );
  }, [originalImageUrl, backendImageWidth, backendImageHeight]);

  const styles = StyleSheet.create({
    container: {
      marginTop: SPACING_SMALL,
      marginBottom: SPACING_SMALL / 2,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 200, // Minimum height for loading indicator
    },
    errorText: {
      color: theme.colors.error,
      textAlign: "center",
      marginTop: SPACING_SMALL,
    },
    faceListContainer: {
      width: "100%",
    },
    listItem: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.roundness,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator animating={true} color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!imageDims || !originalImageUrl || allDetectedFaces.length === 0) {
    return null; // Or display a message indicating no faces/image
  }

  return (
    <View style={styles.container}>
      <FaceBoundingBoxes
        image={originalImageUrl}
        imageDimensions={imageDims}
        detectedFaces={allDetectedFaces} // Use allDetectedFaces here
        calculateBoundingBox={calculateBoundingBox}
      />
      {allDetectedFaces.length > 0 && ( // Use allDetectedFaces here
        <View style={styles.faceListContainer}>
          {allDetectedFaces.map((face, index) => (
            <React.Fragment key={face.id || index}>
              <List.Item
                title={face.memberName || `Face ${index + 1}`}
                description={face.emotion ? `Emotion: ${face.emotion}` : ""}
                left={() => {
                  const thumbnailSource = base64ToImageSource(face.thumbnail);
                  return (
                    <Avatar.Image
                      size={40}
                      source={
                        thumbnailSource ||
                        require("@/assets/images/familyAvatar.png")
                      } // Fallback to a default image
                      style={{ backgroundColor: "transparent" }}
                    />
                  );
                }}
                style={styles.listItem}
              />
              {index < allDetectedFaces.length - 1 && (
                <Divider
                  style={{ backgroundColor: theme.colors.onBackground }}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
};

export default FaceDetectionResultDisplay;
