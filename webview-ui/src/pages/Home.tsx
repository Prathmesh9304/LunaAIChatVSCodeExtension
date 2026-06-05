import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, ChevronDown, Check, Settings, Copy } from "lucide-react";
import { vscode } from "../utilities/vscode";
import lunaLogo from "../../public/assets/luna.svg";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

interface ConfigItem {
  provider: string;
  model: string;
  apiKey: string;
}

interface HomeProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="my-2 rounded-lg overflow-hidden border border-panel-border bg-background shadow-md w-full min-w-0">
      {/* Code Header */}
      <div className="flex justify-between items-center bg-input-bg/85 px-3 py-1.5 border-b border-panel-border text-[10px] text-gray-400 font-mono select-none">
        <span>{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer outline-none"
        >
          {copied ? (
            <>
              <Check size={10} className="text-green-500" />
              <span className="text-green-500 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={10} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code Body */}
      <pre className="p-3 overflow-x-auto text-[11px] font-mono bg-black/20 text-foreground leading-relaxed whitespace-pre select-text">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function parseMessageContent(text: string) {
  if (!text) return null;

  // Split by ```
  const parts = text.split("```");
  
  return parts.map((part, index) => {
    const isCodeBlock = index % 2 !== 0;
    
    if (isCodeBlock) {
      const firstNewLineIndex = part.indexOf("\n");
      let language = "code";
      let code = part;
      
      if (firstNewLineIndex !== -1) {
        language = part.substring(0, firstNewLineIndex).trim();
        code = part.substring(firstNewLineIndex + 1);
      }
      
      if (code.endsWith("\n")) {
        code = code.slice(0, -1);
      }
      
      return <CodeBlock key={index} code={code} language={language} />;
    } else {
      const subparts = part.split("`");
      return (
        <span key={index} className="whitespace-pre-wrap break-words">
          {subparts.map((subpart, subidx) => {
            const isInlineCode = subidx % 2 !== 0;
            if (isInlineCode) {
              return (
                <code key={subidx} className="px-1.5 py-0.5 rounded bg-black/35 font-mono text-xs border border-panel-border/30 text-blue-300">
                  {subpart}
                </code>
              );
            }
            return subpart;
          })}
        </span>
      );
    }
  });
}

export function Home({ messages, setMessages, currentSessionId, setCurrentSessionId }: HomeProps) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Configuration States
  const [config, setConfig] = useState<ConfigItem[]>([]);
  
  // Selection States
  const [selectedProviderName, setSelectedProviderName] = useState("");
  const [selectedModelName, setSelectedModelName] = useState("");
  
  // Dropdown UI States
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const providerDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target as Node)) {
        setIsProviderDropdownOpen(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Request config from backend on mount and listen to messages
  useEffect(() => {
    vscode.postMessage({ type: "getConfig" });

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "config") {
        const loadedConfig = Array.isArray(message.value) ? message.value : [];
        setConfig(loadedConfig);
      } else if (message.type === "reply") {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: message.value,
            sender: "bot"
          }
        ]);
      } else if (message.type === "error") {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `Error: ${message.value}`,
            sender: "bot"
          }
        ]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Get unique configured providers
  const configuredProviders = Array.from(new Set(config.map(c => c.provider)));

  // Sync selections with config updates
  useEffect(() => {
    if (config.length > 0) {
      const providers = Array.from(new Set(config.map(c => c.provider)));
      if (!selectedProviderName || !providers.includes(selectedProviderName)) {
        setSelectedProviderName(providers[0]);
      }
    } else {
      setSelectedProviderName("");
    }
  }, [config, selectedProviderName]);

  // Save active session to history when messages change
  useEffect(() => {
    if (messages.length > 0 && currentSessionId) {
      const firstUserMsg = messages.find((m) => m.sender === "user")?.text || "New Chat";
      const title = firstUserMsg.substring(0, 30) + (firstUserMsg.length > 30 ? "..." : "");
      vscode.postMessage({
        type: "saveSession",
        value: {
          sessionId: currentSessionId,
          title,
          messages
        }
      });
    }
  }, [messages, currentSessionId]);

  useEffect(() => {
    if (selectedProviderName) {
      const models = config.filter(c => c.provider === selectedProviderName).map(c => c.model);
      if (!selectedModelName || !models.includes(selectedModelName)) {
        setSelectedModelName(models[0] || "");
      }
    } else {
      setSelectedModelName("");
    }
  }, [selectedProviderName, config, selectedModelName]);

  // Scroll to bottom on new message or loading
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading || config.length === 0) return;

    // Add user message
    const newMessage: Message = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: "user",
    };

    let nextSessionId = currentSessionId;
    if (!nextSessionId) {
      nextSessionId = Date.now().toString();
      setCurrentSessionId(nextSessionId);
    }

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);

    // Send to backend
    vscode.postMessage({
      type: "sendMessage",
      value: {
        message: newMessage.text,
        provider: selectedProviderName,
        model: selectedModelName
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-background">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 focus:outline-none">
        {config.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(234,179,8,0.2)] animate-pulse-slow">
              <Settings size={32} className="text-yellow-500" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">API Keys Required</h2>
            <p className="text-sm mt-2 max-w-xs opacity-70 leading-relaxed">
              Please go to the Settings tab (gear icon at the top right) to configure an API Key for your preferred provider before using the chat.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/5 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.15)] border border-panel-border/30">
              <div 
                className="w-10 h-10 bg-foreground hover:bg-blue-500 transition-colors duration-300 animate-pulse-slow"
                style={{
                  maskImage: `url("${lunaLogo}")`,
                  WebkitMaskImage: `url("${lunaLogo}")`,
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                }}
              />
            </div>
            <h2 className="text-lg font-semibold text-foreground">How can I help you?</h2>
            <p className="text-sm mt-2 opacity-70">Ask me anything about your code...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="w-full min-w-0">
              {msg.sender === "user" ? (
                /* User Message: Rounded Card with dark background */
                <div className="w-full bg-input-bg/70 border border-panel-border/30 px-4 py-3 rounded-xl text-foreground text-sm font-medium leading-normal">
                  {parseMessageContent(msg.text)}
                </div>
              ) : (
                /* AI Message: Plain Text rendered directly on screen */
                <div className="w-full text-foreground text-sm leading-relaxed whitespace-pre-wrap select-text pr-2">
                  {parseMessageContent(msg.text)}
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="w-full flex justify-start pl-1 py-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0s" }}></span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0.4s" }}></span>
            </div>
          </div>
        )}
        
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area (Docked & Fully Responsive) */}
      <div className="p-4 border-t border-panel-border/30 bg-background/50 backdrop-blur-md z-20 flex flex-col gap-2 shrink-0">
        <div className="flex gap-2 items-center w-full">
          <div className="flex-1 flex items-center gap-2 bg-input-bg border border-panel-border rounded-2xl p-2 shadow-lg transition-all focus-within:ring-2 focus-within:ring-blue-500/50">
            <input
              type="text"
              className="flex-1 w-full bg-transparent border-none outline-none text-foreground px-3 py-2 text-sm placeholder:text-gray-500"
              placeholder={config.length === 0 ? "Please configure keys..." : "Type a message..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || config.length === 0}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading || config.length === 0}
              className={`flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                inputValue.trim() && !isLoading && config.length > 0
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-500 cursor-pointer"
                  : "bg-transparent text-gray-500 cursor-not-allowed"
              }`}
            >
              <Send size={18} className={inputValue.trim() && !isLoading && config.length > 0 ? "translate-x-0.5 -translate-y-0.5" : ""} />
            </button>
          </div>
        </div>
        
        {/* Selection Dropdowns (Wrap responsively) */}
        {config.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-1">
            {/* Provider Dropdown */}
            <div className="relative" ref={providerDropdownRef}>
              <button 
                onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
                className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 hover:text-foreground hover:bg-input-bg/80 px-2.5 py-1 rounded-md transition-colors cursor-pointer outline-none min-w-[110px] justify-between border border-panel-border/30 bg-input-bg"
              >
                <span className="truncate">{selectedProviderName || "Provider"}</span>
                <ChevronDown size={11} className={`opacity-70 flex-shrink-0 transition-transform ${isProviderDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProviderDropdownOpen && (
                <div className="absolute bottom-full mb-1 left-0 min-w-[130px] bg-input-bg border border-panel-border rounded-lg shadow-xl z-50 p-1 flex flex-col animate-fade-in-up">
                  {configuredProviders.map((prov) => (
                    <button
                      key={prov}
                      onClick={() => {
                        setSelectedProviderName(prov);
                        setIsProviderDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 text-[11px] rounded-md transition-colors cursor-pointer ${
                        selectedProviderName === prov ? "bg-blue-500/10 text-foreground" : "text-gray-400 hover:bg-background/50 hover:text-foreground"
                      }`}
                    >
                      {prov}
                      {selectedProviderName === prov && <Check size={11} className="text-blue-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Model Dropdown */}
            <div className="relative" ref={modelDropdownRef}>
              <button 
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 hover:text-foreground hover:bg-input-bg/80 px-2.5 py-1 rounded-md transition-colors cursor-pointer outline-none min-w-[140px] justify-between border border-panel-border/30 bg-input-bg"
              >
                <span className="truncate">{selectedModelName || "Model"}</span>
                <ChevronDown size={11} className={`opacity-70 flex-shrink-0 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isModelDropdownOpen && (
                <div className="absolute bottom-full mb-1 left-0 min-w-[160px] bg-input-bg border border-panel-border rounded-lg shadow-xl z-50 p-1 flex flex-col max-h-[200px] overflow-y-auto animate-fade-in-up">
                  {config
                    .filter(c => c.provider === selectedProviderName)
                    .map((item) => (
                      <button
                        key={item.model}
                        onClick={() => {
                          setSelectedModelName(item.model);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 text-[11px] rounded-md transition-colors cursor-pointer ${
                          selectedModelName === item.model ? "bg-blue-500/10 text-foreground" : "text-gray-400 hover:bg-background/50 hover:text-foreground"
                        }`}
                      >
                        <span className="truncate text-left">{item.model}</span>
                        {selectedModelName === item.model && <Check size={11} className="text-blue-500 flex-shrink-0" />}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
