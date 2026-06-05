import { useState, useEffect } from "react";
import { MessageSquare, Plus, History as HistoryIcon, Settings, Sparkles } from "lucide-react";
import { vscode } from "./utilities/vscode";
import "./index.css";
import { Home } from "./pages/Home";
import { History } from "./pages/History";
import { Setting } from "./pages/Setting";

type Page = "home" | "history" | "setting";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Restore page state on mount (but not active chat messages, so it fresh starts)
  useEffect(() => {
    const state = vscode.getState() as { currentPage?: Page };
    if (state?.currentPage) {
      setCurrentPage(state.currentPage);
    }
    
    // Request history from backend
    vscode.postMessage({ type: "getHistory" });
  }, []);

  // Save page state when page changes
  useEffect(() => {
    const currentState = vscode.getState() as any || {};
    vscode.setState({ ...currentState, currentPage });
  }, [currentPage]);

  // Listen to messages from backend
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "history") {
        setHistory(Array.isArray(message.value) ? message.value : []);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setCurrentPage("home");
  };

  const loadSession = (sessionId: string) => {
    const session = history.find(h => h.id === sessionId);
    if (session) {
      setCurrentSessionId(session.id);
      setMessages(session.messages || []);
      setCurrentPage("home");
    }
  };

  const deleteSession = (sessionId: string) => {
    vscode.postMessage({ type: "deleteSession", value: { sessionId } });
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  return (
    <main className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden">
      
      {/* Subtle, Bordered Header / Navbar */}
      <header className="w-full shrink-0 bg-transparent border-b border-panel-border flex items-center justify-between p-3">
        <div className="font-bold flex items-center gap-2 text-primary">
          <Sparkles size={18} className="text-blue-500" />
          <span className="tracking-wide">Luna Chat</span>
        </div>
        <div className="flex space-x-2">
          {/* New Chat (Plus) */}
          <button
            onClick={startNewChat}
            title="New Chat"
            className="p-2 rounded-md transition-colors text-gray-500 hover:text-foreground hover:bg-input-bg cursor-pointer"
          >
            <Plus size={18} />
          </button>

          {/* Chat Page (MessageSquare) */}
          <button
            onClick={() => setCurrentPage("home")}
            title="Chat"
            className={`p-2 rounded-md transition-colors ${
              currentPage === "home" 
                ? "bg-input-bg text-primary shadow-sm border border-panel-border" 
                : "text-gray-500 hover:text-foreground hover:bg-input-bg"
            }`}
          >
            <MessageSquare size={18} />
          </button>

          {/* History Page */}
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

          {/* Settings Page */}
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
        {currentPage === "home" && (
          <Home 
            messages={messages} 
            setMessages={setMessages} 
            currentSessionId={currentSessionId}
            setCurrentSessionId={setCurrentSessionId}
          />
        )}
        {currentPage === "history" && (
          <History 
            history={history} 
            onSelectSession={loadSession} 
            onDeleteSession={deleteSession}
          />
        )}
        {currentPage === "setting" && <Setting />}
      </div>
    </main>
  );
}

export default App;
