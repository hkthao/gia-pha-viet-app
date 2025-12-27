// gia-pha-viet-app/components/face/FaceBoundingBoxes.tsx
import React, { useMemo } from 'react';
import { StyleSheet, View, Image } from 'react-native'; // Removed Dimensions
import { Svg, Rect, G, Text as SvgText } from 'react-native-svg';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { DetectedFaceDto } from '@/types';
import { SPACING_MEDIUM } from '@/constants/dimensions';

interface ImageDimensions {
  width: number;
  height: number;
}

interface BoundingBoxCalculation {
  scaledX: number;
  scaledY: number;
  scaledWidth: number;
  scaledHeight: number;
  offsetX: number;
  offsetY: number;
}

interface FaceBoundingBoxesProps {
  image: string | null;
  imageDimensions: ImageDimensions | null;
  detectedFaces: DetectedFaceDto[];
  calculateBoundingBox: (
    face: DetectedFaceDto,
    containerDimensions: ImageDimensions,
    imageDimensions: ImageDimensions
  ) => BoundingBoxCalculation | null;
  onPressFace?: (face: DetectedFaceDto) => void;
  // screenWidth: number; // Removed screenWidth from props, calculate internally
  // t: (key: string) => string; // Removed t from props, use useTranslation internally
  showLabels?: boolean;
}

const FaceBoundingBoxes: React.FC<FaceBoundingBoxesProps> = ({
  image,
  imageDimensions,
  detectedFaces,
  calculateBoundingBox,
  onPressFace,
  showLabels = true,
}) => {
  console.log("FaceBoundingBoxes: Component rendered", { image, imageDimensions, detectedFacesCount: detectedFaces.length });
  const theme = useTheme();
  const { t } = useTranslation();

  const [containerDimensions, setContainerDimensions] = React.useState<{ width: number; height: number } | null>(null);

  const styles = useMemo(() => StyleSheet.create({
    imageContainer: {
      width: '100%',
      aspectRatio: 4 / 3, // Assuming a common aspect ratio
      borderColor: theme.colors.outline,
      borderWidth: 0.5,
      borderRadius: theme.roundness,
      marginBottom: SPACING_MEDIUM,
      position: 'relative',
      overflow: 'hidden', // Ensures bounding boxes don't go outside
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
  }), [theme]);

  if (!image || !imageDimensions) {
    console.log("FaceBoundingBoxes: Not rendering, image or imageDimensions are null", { image, imageDimensions });
    return null;
  }

  return (
    <View
      style={styles.imageContainer}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width === 0 || height === 0) {
          console.warn("FaceBoundingBoxes: containerDimensions received 0 for width or height", { width, height });
        }
        console.log("FaceBoundingBoxes: onLayout fired, containerDimensions", { width, height });
        setContainerDimensions({ width, height });
      }}
    >
      <Image source={{ uri: image }} style={styles.image} />
      {containerDimensions && (
        <Svg
          height={containerDimensions.height}
          width={containerDimensions.width}
          style={StyleSheet.absoluteFill}
        >
          {detectedFaces.map((face) => {
            const roundedScaledBox = calculateBoundingBox(
              face,
              containerDimensions, // Pass actual container dimensions
              imageDimensions
            );

            if (!roundedScaledBox) {
              console.log("FaceBoundingBoxes: Bounding box is null for face", face.id);
              return null;
            }

            const memberName = face.memberName || t('faceDataForm.unassigned');
            console.log("FaceBoundingBoxes: Drawing box for", face.id, { roundedScaledBox, imageDimensions, containerDimensions, memberName });

            return ( 
              <G
                key={face.id}
                onPress={() => onPressFace && onPressFace(face)}
              >
                <Rect
                  x={roundedScaledBox.scaledX}
                  y={roundedScaledBox.scaledY}
                  width={roundedScaledBox.scaledWidth}
                  height={roundedScaledBox.scaledHeight}
                  stroke={face.memberId ? theme.colors.primary : theme.colors.error}
                  strokeWidth="2"
                  fill="rgba(0,0,0,0)"
                />
                {showLabels && (
                  <>
                    <Rect
                      x={roundedScaledBox.scaledX + roundedScaledBox.scaledWidth / 2 - (memberName.length * 3)}
                      y={roundedScaledBox.scaledY - 20}
                      width={memberName.length * 6 + 10}
                      height="20"
                      fill="rgba(0,0,0,0.5)"
                      rx="3"
                      ry="3"
                    />
                    <SvgText
                      x={roundedScaledBox.scaledX + roundedScaledBox.scaledWidth / 2}
                      y={roundedScaledBox.scaledY - 5}
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {memberName}
                    </SvgText>
                  </>
                )}
              </G>
            );
          })}
        </Svg>
      )}
    </View>
  );
};

export default FaceBoundingBoxes;