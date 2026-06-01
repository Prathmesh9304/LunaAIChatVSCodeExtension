import { Clock, MessageSquare, ChevronRight } from "lucide-react";

export function History() {
  return (
    <div className="flex flex-col h-full w-full p-6 space-y-6 overflow-y-auto animate-fade-in-up">
      <div className="flex items-center gap-2 text-primary">
        <Clock size={24} className="text-blue-500" />
        <h2 className="text-2xl font-bold tracking-tight">Recent Chats</h2>
      </div>
      
      <div className="flex flex-col space-y-3">
        <div className="glass-panel p-4 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background/50 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <MessageSquare size={16} />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">How to optimize React?</div>
                <div className="text-xs text-gray-500 mt-0.5">2 hours ago • 4 messages</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-500 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background/50 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <MessageSquare size={16} />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Explain TypeScript Generics</div>
                <div className="text-xs text-gray-500 mt-0.5">Yesterday • 12 messages</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-500 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}
