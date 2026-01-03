/**
 * Main App component for the auth application
 * Sets up routing and theme provider
 */

import { RouterProvider } from "react-router-dom";
import { ThemeManager } from "@repo/ui";
import { router } from "./router";
import './App.css';

function App() {
  return (
    <ThemeManager>
      <RouterProvider router={router} />
    </ThemeManager>
  );
}

export default App;
