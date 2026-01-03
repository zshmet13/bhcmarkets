import { ThemeProvider } from "@repo/ui";
import { AuthProvider } from "./components/AuthContext";
import { AuthPage } from "./components/AuthPage";

import './App.css'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
