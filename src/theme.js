import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2979ff",         // bleu inspirant
      light: "#82b1ff",
      dark: "#1565c0"
    },
    secondary: {
      main: "#8f5cff",         // violet inspirant
      light: "#d1b3ff",
      dark: "#6c32af"
    },
    error: { main: "#b00020" }, // rouge haute priorité
    warning: { main: "#bf8600" }, // orange moyenne
    success: { main: "#296d25" }, // vert basse
    background: {
      default: "#f6f7fb"
    }
  },
  typography: {
    fontFamily: [
      "Inter",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif"
    ].join(",")
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(8px)",
          background: "rgba(255,255,255,0.64)",
          boxShadow: "0 4px 24px 0 rgba(80,80,120,0.11)",
          borderRadius: "16px"
        }
      }
    }
  }
});

export default theme;
