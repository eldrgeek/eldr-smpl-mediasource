import React, { useEffect } from "react";
import "./styles.css";
import mediaProcessor from "./mediaProcessor";
export default function App() {
  useEffect(() => {
    setTimeout(() => mediaProcessor(), 500);
  }, []);

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
