import { useState, useEffect } from "react";
import { Settings2, Key, Save, Database, Trash2, Eye, EyeOff } from "lucide-react";
import { ProviderSelect } from "../components/ProviderSelect";
import { provider } from "../utilities/util";
import { vscode } from "../utilities/vscode";

interface ConfigItem {
  provider: string;
  model: string;
  apiKey: string;
}

const renderLogo = (providerName: string, logoUrl: string, sizeClass = "w-4 h-4") => {
  const isColored = providerName === "Google Gemini" || providerName === "Mistral";
  
  if (isColored) {
    return (
      <img src={logoUrl} className={`${sizeClass} object-contain`} alt={providerName} />
    );
  } else {
    return (
      <div 
        className={`${sizeClass} bg-foreground`} 
        style={{
          maskImage: `url("${logoUrl}")`,
          WebkitMaskImage: `url("${logoUrl}")`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      />
    );
  }
};

export function Setting() {
  const [config, setConfig] = useState<ConfigItem[]>([]);
  
  // Local Selection States (persisted via VS Code State API)
  const [selectedProviderName, setSelectedProviderName] = useState(provider[0]?.name || "");
  const [selectedModel, setSelectedModel] = useState(provider[0]?.model[0] || "");
  
  const [apiKeyInput, setApiKeyInput] = useState("");
  
  // Top level password visibility
  const [showTopKey, setShowTopKey] = useState(false);
  
  // List level password visibility
  const [visibleKeys, setVisibleKeys] = useState<{ [key: number]: boolean }>({});

  // Restore VS Code local selection state on mount
  useEffect(() => {
    const savedState = vscode.getState() as any || {};
    if (savedState.selectedProviderName) {
      setSelectedProviderName(savedState.selectedProviderName);
    }
    if (savedState.selectedModel) {
      setSelectedModel(savedState.selectedModel);
    }
  }, []);

  // Save local selection state to VS Code state
  useEffect(() => {
    const savedState = vscode.getState() as any || {};
    vscode.setState({
      ...savedState,
      selectedProviderName,
      selectedModel
    });
  }, [selectedProviderName, selectedModel]);

  // Request config from backend on mount and listen to messages
  useEffect(() => {
    vscode.postMessage({ type: "getConfig" });

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "config") {
        const loadedConfig = Array.isArray(message.value) ? message.value : [];
        setConfig(loadedConfig);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Update top API key input when selection or loaded config changes
  useEffect(() => {
    const matched = config.find(
      (c) => c.provider === selectedProviderName && c.model === selectedModel
    );
    setApiKeyInput(matched ? matched.apiKey : "");
  }, [selectedProviderName, selectedModel, config]);

  const handleProviderChange = (p: any) => {
    setSelectedProviderName(p.name);
    setSelectedModel(p.model[0] || "");
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  const handleSave = () => {
    const updated = [...config];
    const idx = updated.findIndex(
      (c) => c.provider === selectedProviderName && c.model === selectedModel
    );
    if (idx >= 0) {
      updated[idx] = {
        provider: selectedProviderName,
        model: selectedModel,
        apiKey: apiKeyInput
      };
    } else {
      updated.push({
        provider: selectedProviderName,
        model: selectedModel,
        apiKey: apiKeyInput
      });
    }
    setConfig(updated);
    vscode.postMessage({ type: "saveConfig", value: updated });
  };

  const handleListApiKeyChange = (index: number, val: string) => {
    setConfig((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], apiKey: val };
      return updated;
    });
  };

  const saveListConfig = () => {
    vscode.postMessage({ type: "saveConfig", value: config });
  };

  const handleDelete = (index: number) => {
    const updated = config.filter((_, idx) => idx !== index);
    setConfig(updated);
    vscode.postMessage({ type: "saveConfig", value: updated });
  };

  const handleEditInConfig = () => {
    vscode.postMessage({ type: "editConfig" });
  };

  const toggleListKeyVisibility = (idx: number) => {
    setVisibleKeys((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const selectedProviderObj = provider.find(p => p.name === selectedProviderName) || provider[0];

  return (
    <div className="flex flex-col h-full w-full p-4 space-y-4 overflow-y-auto animate-fade-in-up">
      {/* Header with edit in config button */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2 text-primary">
          <Settings2 size={24} className="text-blue-500" />
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        </div>
        <button
          type="button"
          onClick={handleEditInConfig}
          className="text-xs text-blue-500 hover:text-blue-400 underline transition-all cursor-pointer font-medium"
        >
          Edit in config
        </button>
      </div>
      
      {/* Editor Panel */}
      <div className="glass-panel p-4 rounded-xl space-y-4 shadow-sm border border-white/5">
        <ProviderSelect
          providers={provider}
          selectedProvider={selectedProviderObj}
          selectedModel={selectedModel}
          onProviderChange={handleProviderChange}
          onModelChange={handleModelChange}
        />

        {/* API Key Setting */}
        <div className="flex flex-col space-y-2 group">
          <label className="text-sm font-medium text-foreground flex items-center gap-2 opacity-80">
            <Key size={16} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
            API Key
          </label>
          <div className="relative flex items-center w-full bg-input-bg border border-panel-border rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/50 hover:bg-background/80 transition-all">
            <input 
              type={showTopKey ? "text" : "password"}
              placeholder="Enter API Key..."
              className="bg-transparent border-none outline-none text-foreground text-sm w-full pr-8 py-1.5"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowTopKey(!showTopKey)}
              className="absolute right-3 text-gray-400 hover:text-foreground transition-colors cursor-pointer"
            >
              {showTopKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Your API key is stored securely locally.</p>
        </div>
      </div>

      {/* Stored Configurations List */}
      <div className="glass-panel p-4 rounded-xl space-y-4 shadow-sm border border-white/5">
        <h3 className="text-sm font-semibold text-foreground opacity-90 flex items-center gap-2">
          <Database size={16} className="text-blue-500" />
          Stored Configurations
        </h3>
        
        {config.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-500 border border-dashed border-panel-border rounded-xl">
            No stored configurations. Add one above.
          </div>
        ) : (
          <div className="space-y-4">
            {config.map((item, index) => {
              const matchedProvider = provider.find(p => p.name === item.provider);
              const logoUrl = matchedProvider ? matchedProvider.logo : "";
              const isActive = selectedProviderName === item.provider && selectedModel === item.model;
              
              return (
                <div 
                  key={index} 
                  className={`flex flex-col p-4 rounded-xl border transition-all space-y-3 ${
                    isActive 
                      ? "border-blue-500/50 bg-blue-500/5" 
                      : "border-panel-border/40 bg-background/20"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      {/* Model Name first in Big */}
                      <h4 className="text-base font-bold text-foreground tracking-tight leading-none">{item.model}</h4>
                      
                      {/* Provider name below it */}
                      <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-2">
                        {matchedProvider && renderLogo(item.provider, logoUrl, "w-3.5 h-3.5")}
                        {item.provider}
                        {isActive && (
                          <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-semibold">
                            Active in selector
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Select/Activate Button */}
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProviderName(item.provider);
                            setSelectedModel(item.model);
                          }}
                          className="text-[10px] text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 px-2 py-1 rounded-md transition-all cursor-pointer font-medium"
                        >
                          Select
                        </button>
                      )}
                      
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(index)}
                        className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-input-bg transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Password-like input box */}
                  <div className="relative flex items-center w-full bg-input-bg border border-panel-border/50 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/50 hover:bg-background/80 transition-all">
                    <input
                      type={visibleKeys[index] ? "text" : "password"}
                      className="bg-transparent border-none outline-none text-xs text-foreground w-full pr-8 py-1"
                      value={item.apiKey}
                      onChange={(e) => handleListApiKeyChange(index, e.target.value)}
                      onBlur={saveListConfig} // Autosave on blur
                      placeholder="API Key..."
                    />
                    <button
                      type="button"
                      onClick={() => toggleListKeyVisibility(index)}
                      className="absolute right-3 text-gray-400 hover:text-foreground transition-colors cursor-pointer"
                    >
                      {visibleKeys[index] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button 
        type="button"
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-semibold mt-4 shadow-blue-500/20 active:scale-[0.98] cursor-pointer shrink-0"
      >
        <Save size={18} />
        Save Configuration
      </button>
    </div>
  );
}
