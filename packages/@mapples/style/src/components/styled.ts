import { Image, ImageBackground } from 'expo-image';
import {
  Text,
  View,
  ScrollView,
  Pressable,
  SectionList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styled } from '../hocs';

/** A `View` component enhanced with styled props for theme and responsive support. */
export const StyledView = styled(View);

/** A `Text` component enhanced with styled props for theme and responsive support. */
export const StyledText = styled(Text);

/** An `Image` component (expo-image) enhanced with styled props for theme and responsive support. */
export const StyledImage = styled(Image);

/** A `ScrollView` component enhanced with styled props for theme and responsive support. */
export const StyledScrollView = styled(ScrollView);

/** An `ImageBackground` component (expo-image) enhanced with styled props for theme and responsive support. */
export const StyledImageBackground = styled(ImageBackground);

/** A `Pressable` component enhanced with styled props for theme and responsive support. */
export const StyledPressable = styled(Pressable);

/** A `SectionList` component enhanced with styled props for theme and responsive support. */
export const StyledSectionList = styled(SectionList);

/** A `TextInput` component enhanced with styled props for theme and responsive support. */
export const StyledTextInput = styled(TextInput);

/** A `SafeAreaView` component enhanced with styled props for theme and responsive support. */
export const StyledSafeAreaView = styled(SafeAreaView);
