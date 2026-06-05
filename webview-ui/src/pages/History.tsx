import { Clock, MessageSquare, ChevronRight, Trash2 } from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: Array<{
    id: number;
    text: string;
    sender: "user" | "bot";
  }>;
}

interface HistoryProps {
  history: ChatSession[];
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

export function History({ history, onSelectSession, onDeleteSession }: HistoryProps) {
  
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full w-full p-4 space-y-4 overflow-y-auto animate-fade-in-up">
      <div className="flex items-center gap-2 text-primary">
        <Clock size={24} className="text-blue-500" />
        <h2 className="text-2xl font-bold tracking-tight">Recent Chats</h2>
      </div>
      
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-gray-500 p-6 text-center h-[50vh]">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <MessageSquare size={32} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No recent chats</h3>
          <p className="text-sm mt-1 opacity-70 max-w-xs">
            Start a new conversation on the Chat tab to see your local history here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {history.map((session) => {
            const count = session.messages ? session.messages.length : 0;
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className="glass-panel p-4 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group shadow-sm flex justify-between items-center"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-background/50 text-blue-400 group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                    <MessageSquare size={16} />
                  </div>
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="text-sm font-semibold text-foreground truncate">{session.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatTime(session.timestamp)} • {count} {count === 1 ? "message" : "messages"}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete Chat"
                  >
                    <Trash2 size={15} />
                  </button>
                  <ChevronRight size={16} className="text-gray-500 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
