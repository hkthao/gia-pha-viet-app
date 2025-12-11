import React, { useState, useRef, useCallback, useEffect } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import OptionSelectBottomSheet, { Option } from '@/components/common/OptionSelectBottomSheet';

export interface UseOptionSelectBottomSheetResult {
  /**
   * Opens the bottom sheet with the given options, onSelect callback, and optional title/selectedValue.
   */
  openBottomSheet: (
    options: Option[],
    onSelect: (value: any) => void,
    title?: string,
    selectedValue?: any
  ) => void;
  /**
   * Closes the bottom sheet.
   */
  closeBottomSheet: () => void;
  /**
   * The OptionSelectBottomSheet component that needs to be rendered in your component tree.
   * It is controlled by the openBottomSheet/closeBottomSheet functions.
   */
  OptionSelectBottomSheetComponent: React.FC;
}

/**
 * @hook useOptionSelectBottomSheet
 * @description Hook to manage the state and display of a reusable OptionSelectBottomSheet.
 * This hook provides functions to open/close the bottom sheet and the component itself to render.
 */
export function useOptionSelectBottomSheet(): UseOptionSelectBottomSheetResult {
  const bottomSheetRef = useRef<BottomSheet>(null);

  // State to hold the current options and callbacks for the sheet
  const [sheetState, setSheetState] = useState<{
    options: Option[];
    onSelect: (value: any) => void;
    title?: string;
    selectedValue?: any;
  } | null>(null);

      const openBottomSheet = useCallback(
    (options: Option[], onSelect: (value: any) => void, title?: string, selectedValue?: any) => {
      setSheetState({ options, onSelect, title, selectedValue });
    },
    []
  );

  const closeBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    // Clear state after closing, can be debounced if animations are long
    setTimeout(() => setSheetState(null), 300);
  }, []);

  const handleSelect = useCallback(
    (value: any) => {
      sheetState?.onSelect(value); // Call the onSelect passed to openBottomSheet
      closeBottomSheet();
    },
    [sheetState, closeBottomSheet]
  );

  // Define the component internally
  const OptionSelectBottomSheetComponent = () => {
    // This useEffect will ensure expand() is called after the BottomSheet component mounts
    useEffect(() => {
      if (sheetState && bottomSheetRef.current) {
        setTimeout(() => {
          bottomSheetRef.current?.snapToIndex(0); // Changed from expand() to snapToIndex(0)
        }, 50); // 50ms delay
      }
      // Clean up when the sheet state is cleared or component unmounts
      return () => {
        if (!sheetState && bottomSheetRef.current) {
          bottomSheetRef.current.close();
        }
      };
    }, [sheetState]); // Depend on sheetState to trigger when it becomes non-null

    if (!sheetState) return null; // Only render when open
    return (
      <OptionSelectBottomSheet
        ref={bottomSheetRef}
        options={sheetState.options}
        onSelect={handleSelect}
        onClose={closeBottomSheet}
        title={sheetState.title}
        selectedValue={sheetState.selectedValue}
      />
    );
  };

  return { openBottomSheet, closeBottomSheet, OptionSelectBottomSheetComponent };
}
