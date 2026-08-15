import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { CompareProvider } from "./context/CompareContext.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import { RecentlyViewedProvider } from "./context/RecentlyViewedContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CompareProvider>
        <FavoritesProvider>
          <RecentlyViewedProvider>
            <App />
          </RecentlyViewedProvider>
        </FavoritesProvider>
      </CompareProvider>
    </BrowserRouter>
  </React.StrictMode>
);
