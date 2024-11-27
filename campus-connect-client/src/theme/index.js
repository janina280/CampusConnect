import PropTypes from "prop-types";
import { useMemo } from "react";
// @mui
import { CssBaseline } from "@mui/material";
import {
  createTheme,
  ThemeProvider as MUIThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";
// hooks
import useSettings from "../hooks/useSettings.js";
//
import palette from "./palette";
import typography from "./typography";
import breakpoints from "./breakpoints";
import componentsOverride from "./overrides";
import shadows, { customShadows } from "./shadows";

// ----------------------------------------------------------------------

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

export default function ThemeProvider({ children }) {
  const { themeMode, themeDirection } = useSettings();


  const themeOptions = useMemo(
    () => ({
      palette: palette.light, 
      typography,
      breakpoints,
      shape: { borderRadius: 8 },
      direction: themeDirection,
      shadows: shadows.light,
      customShadows: customShadows.light,
    }),
    [themeDirection] 
  );
  

  const theme = createTheme(themeOptions);

  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}
