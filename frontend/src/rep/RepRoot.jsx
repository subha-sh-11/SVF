"use client";

import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import App from "./App";
import "./rep.css";

// Mounts the representative SPA (unchanged) inside the Next app under /rep.
export default function RepRoot() {
  return (
    <div className="rep-root">
      <BrowserRouter basename="/rep">
        <AppProvider>
          <App />

        </AppProvider>
      </BrowserRouter>
    </div>
  );
}

