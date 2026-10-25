import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import { PackagesProvider } from "./PackagesContext.jsx";
import "../styles.css";

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Could not register the offline app shell.", error);
    });
  });
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PackagesProvider>
          <App />
        </PackagesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
