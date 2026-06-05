import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

export interface ProviderItem {
  logo: string;
  name: string;
  model: string[];
}

interface ProviderSelectProps {
  providers: ProviderItem[];
  selectedProvider: ProviderItem;
  selectedModel: string;
  onProviderChange: (provider: ProviderItem) => void;
  onModelChange: (model: string) => void;
}

const renderLogo = (providerName: string, logoUrl: string, sizeClass = "w-5 h-5") => {
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

export function ProviderSelect({
  providers,
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
}: ProviderSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProviders = providers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-5">
      {/* Provider Selector */}
      <div className="flex flex-col space-y-2" ref={dropdownRef}>
        <label className="text-sm font-medium text-foreground opacity-90">Provider</label>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between bg-input-bg border border-panel-border hover:bg-background/80 text-foreground rounded-xl p-3 outline-none transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {renderLogo(selectedProvider.name, selectedProvider.logo)}
              <span className="font-medium">{selectedProvider.name}</span>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-input-bg border border-panel-border rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[300px]">
              <div className="p-2 border-b border-panel-border/50">
                <div className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-2 border border-panel-border/50 focus-within:ring-2 focus-within:ring-blue-500/50">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search providers..."
                    className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-gray-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto flex-1 p-2">
                <div className="text-xs font-semibold text-gray-500 mb-2 px-2 tracking-wider">
                  POPULAR
                </div>
                <div className="space-y-0.5">
                  {filteredProviders.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        onProviderChange(p);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${
                        selectedProvider.name === p.name ? "bg-blue-500/10 text-foreground" : "hover:bg-background/50 text-foreground/80 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {renderLogo(p.name, p.logo)}
                        <span className="text-sm font-medium">{p.name}</span>
                      </div>
                      {selectedProvider.name === p.name && <Check size={16} className="text-blue-500" />}
                    </button>
                  ))}
                  {filteredProviders.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No providers found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-px w-full bg-panel-border/50"></div>

      {/* Model Selector */}
      <div className="flex flex-col space-y-2 group">
        <label className="text-sm font-medium text-foreground flex items-center gap-2 opacity-80">
          Model
        </label>
        <select 
          className="w-full bg-background/50 border border-panel-border text-foreground rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer hover:bg-background/80"
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
        >
          {selectedProvider.model.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

