/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colours } from '../constants/Colours';
import { useColorScheme } from './useColourScheme';

export function useThemeColour(
  props: { light?: string; dark?: string },
  colourName: keyof typeof Colours.light & keyof typeof Colours.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colourFromProps = props[theme];

  if (colourFromProps) {
    return colourFromProps;
  } else {
    return Colours[theme][colourName];
  }
}
