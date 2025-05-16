import { useState } from "react";
import "./App.css";
import HtmlToPng from "./components/HtmlToPng";

function App() {
  const loremIpsumText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
    commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
    velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
    occaecat cupidatat non proident, sunt in culpa qui officia deserunt
    mollit anim id est laborum.`;

  return (
    <div className="app">
      <h1>HTML to PNG Converter</h1>
      <HtmlToPng content={loremIpsumText} />
    </div>
  );
}

export default App;
