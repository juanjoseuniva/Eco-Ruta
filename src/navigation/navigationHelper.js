import { LayoutAnimation } from 'react-native';

export const changeScreen = (setCurrentScreen, screenName) => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setCurrentScreen(screenName);
};