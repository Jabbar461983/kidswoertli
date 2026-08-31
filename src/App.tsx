import { useAuth } from "./contexts/AuthContext";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";

function App() {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium">KidsWoertli lädt...</p>
        </div>
      </div>
    );
  }

  return profile ? <Dashboard /> : <Login />;
}

export default App;
