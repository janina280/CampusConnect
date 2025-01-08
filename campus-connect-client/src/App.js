import React from 'react';

import Router from "./routes";

import ThemeProvider from './theme';

import ThemeSettings from './components/settings';


import { GoogleOAuthProvider } from "@react-oauth/google"; 

function App() {
  return (
    
    <GoogleOAuthProvider clientId="342833311760-ld5bv7u2nsocr1k7uncm12hh8hq6hp7s.apps.googleusercontent.com"> 
      <ThemeProvider>
        <ThemeSettings>
          <Router /> 
        </ThemeSettings>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
