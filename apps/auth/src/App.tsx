import { AuthProvider, useAuth } from "./components/AuthContext";
import type { AuthContextType, User } from "./components/AuthContext";
import { RequireAuth } from "./components/RequireAuth";
import { AuthPage } from "./components/AuthPage";
import { LoginForm } from "./components/Forms/LoginForm";
import { RegisterForm } from "./components/Forms/RegisterForm";
import { UserOrLogin } from "./components/UserOrLogin";
import type { UserOrLoginProps } from "./components/UserOrLogin";


import './App.css'

function App() {
  return (<div className="App">
      <AuthProvider>
        <RequireAuth>
          <h1>Protected App Content</h1>
        </RequireAuth>
      </AuthProvider>
    </div>
  )
}

export default App
