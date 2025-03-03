import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import LoginPage from "./pages/LoginPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.tsx";
import AdminPage from "./pages/AdminPage.tsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
