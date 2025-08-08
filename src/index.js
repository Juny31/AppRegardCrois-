import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import '@fontsource/inter'; // Ajoute la police Inter

// 🎨 Thème MUI customisé
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5b5fc7', // bleu/violet doux
    },
    secondary: {
      main: '#01bfae', // turquoise doux
    },
    background: {
      default: "#f7fafd", // fond très clair
      paper: "rgba(255,255,255,0.6)", // effet glassmorphisme de base
    },
    error: { main: "#b00020" },
    warning: { main: "#bf8600" },
    success: { main: "#296d25" },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: { fontWeight: 700, letterSpacing: "-1.5px" },
    h2: { fontWeight: 600, letterSpacing: "-1px" },
    h6: { fontWeight: 600 }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          // Glassmorphisme léger
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 16px 0 rgba(91,95,199,0.10)",
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          fontWeight: 600,
          textTransform: "none"
        }
      }
    }
  }
});

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);
