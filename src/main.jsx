import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import { PackagesProvider } from "./PackagesContext.jsx";
import "../styles.css";

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
