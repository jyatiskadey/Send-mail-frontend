import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MailDashboard from "./Pages/MailDashboard";
import AuthPage from "./Pages/AuthPage";
import ProtectedRoute from "./Pages/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
      <Route element={<ProtectedRoute />}>
          <Route path="/mail" element={<MailDashboard />} />
        </Route>
        <Route path="/" element={<AuthPage />} />
      </Routes>
    </Router>
  );
}

export default App;
