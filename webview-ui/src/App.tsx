import { useState, useEffect } from "react";
import { MessageSquarePlus, History as HistoryIcon, Settings, Sparkles } from "lucide-react";
import { vscode } from "./utilities/vscode";
import "./index.css";
import { Home } from "./pages/Home";
import { History } from "./pages/History";
import { Setting } from "./pages/Setting";

type Page = "home" | "history" | "setting";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  // Restore state on mount
  useEffect(() => {
    const state = vscode.getState() as { currentPage?: Page };
    if (state?.currentPage) {
      setCurrentPage(state.currentPage);
    }
  }, []);

  // Save state when page changes
  useEffect(() => {
    const currentState = vscode.getState() as any || {};
    vscode.setState({ ...currentState, currentPage });
  }, [currentPage]);

  return (
    <main className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden">
      
      {/* Subtle, Bordered Header / Navbar */}
      <header className="w-full shrink-0 bg-transparent border-b border-panel-border flex items-center justify-between p-3">
        <div className="font-bold flex items-center gap-2 text-primary">
          <Sparkles size={18} className="text-blue-500" />
          <span className="tracking-wide">Luna Chat</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage("home")}
            title="New Chat"
            className={`p-2 rounded-md transition-colors ${
              currentPage === "home" 
                ? "bg-input-bg text-primary shadow-sm border border-panel-border" 
                : "text-gray-500 hover:text-foreground hover:bg-input-bg"
            }`}
          >
            <MessageSquarePlus size={18} />
          </button>
          <button
            onClick={() => setCurrentPage("history")}
            title="History"
            className={`p-2 rounded-md transition-colors ${
              currentPage === "history" 
                ? "bg-input-bg text-primary shadow-sm border border-panel-border" 
                : "text-gray-500 hover:text-foreground hover:bg-input-bg"
            }`}
          >
            <HistoryIcon size={18} />
          </button>
          <button
            onClick={() => setCurrentPage("setting")}
            title="Settings"
            className={`p-2 rounded-md transition-colors ${
              currentPage === "setting" 
                ? "bg-input-bg text-primary shadow-sm border border-panel-border" 
                : "text-gray-500 hover:text-foreground hover:bg-input-bg"
            }`}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {currentPage === "home" && <Home />}
        {currentPage === "history" && <History />}
        {currentPage === "setting" && <Setting />}
      </div>
    </main>
  );
}

export default App;
