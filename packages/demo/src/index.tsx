import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./styles.css";
import Root from "./views/Root";
import { MapLibreView } from "./views/MapLibreView";
import { LoginView } from "./views/LoginView";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/map" element={<MapLibreView />} />
        <Route path="/base" element={<Root />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
