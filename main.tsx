import React from "react";
import ReactDOM from "react-dom/client";
import { MiniSynthe } from "./appReactSynth";

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <MiniSynthe />
    </React.StrictMode>
  );
}