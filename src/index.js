import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import mediaProcessor from "./mediaProcessor";
import fileEmitter from "./fileEmitter";
// fileEmitter()
mediaProcessor();
const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
);
