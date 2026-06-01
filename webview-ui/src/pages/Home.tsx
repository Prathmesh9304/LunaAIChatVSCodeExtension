import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Trash2 } from "lucide-react";
import { vscode } from "../utilities/vscode";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

export function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Restore state on mount
  useEffect(() => {
    const state = vscode.getState() as { messages?: Message[] };
    if (state?.messages) {
      setMessages(state.messages);
    }
  }, []);

  // Save state when messages change
  useEffect(() => {
    const currentState = vscode.getState() as any || {};
    vscode.setState({ ...currentState, messages });
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const newMessage: Message = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: "user",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    
    // Simulate bot reply for preview purposes (optional, could be removed later)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev, 
        { id: Date.now() + 1, text: "I'm ready to help you analyze and refactor your code!", sender: "bot" }
      ]);
    }, 1000);
  };

  const handleClearChat = () => {
    setMessages([]);
    const currentState = vscode.getState() as any || {};
    vscode.setState({ ...currentState, messages: [] });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 focus:outline-none pb-24">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <Bot size={32} className="text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">How can I help you?</h2>
            <p className="text-sm mt-2 opacity-70">Ask me anything about your code...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                  {msg.sender === "user" ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <User size={14} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-input-bg border border-panel-border flex items-center justify-center shadow-md">
                      <Bot size={14} className="text-blue-400" />
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm"
                      : "bg-input-bg border border-panel-border text-foreground rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area (Floating) */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex gap-2 items-center">
        {messages.length > 0 && (
          <button 
            onClick={handleClearChat}
            className="p-3 rounded-xl bg-input-bg border border-panel-border text-gray-500 hover:text-red-400 hover:border-red-400/50 transition-colors shadow-sm cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 size={18} />
          </button>
        )}
        <div className="flex-1 flex items-center gap-2 bg-input-bg border border-panel-border rounded-2xl p-2 shadow-lg transition-all focus-within:ring-2 focus-within:ring-blue-500/50">
          <input
            type="text"
            className="flex-1 w-full bg-transparent border-none outline-none text-foreground px-3 py-2 text-sm placeholder:text-gray-500"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${
              inputValue.trim()
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-500 cursor-pointer"
                : "bg-transparent text-gray-500 cursor-not-allowed"
            }`}
          >
            <Send size={18} className={inputValue.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
