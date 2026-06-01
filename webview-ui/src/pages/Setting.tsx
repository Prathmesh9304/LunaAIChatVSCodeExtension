import { Settings2, Palette, Key, Save } from "lucide-react";

export function Setting() {
  return (
    <div className="flex flex-col h-full w-full p-6 space-y-6 overflow-y-auto animate-fade-in-up">
      <div className="flex items-center gap-2 text-primary">
        <Settings2 size={24} className="text-blue-500" />
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      </div>
      
      <div className="glass-panel p-5 rounded-2xl space-y-5 shadow-sm border border-white/5">
        
        {/* Theme Setting */}
        <div className="flex flex-col space-y-2 group">
          <label className="text-sm font-medium text-foreground flex items-center gap-2 opacity-80">
            <Palette size={16} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
            Theme Preference
          </label>
          <select className="bg-background/50 border border-panel-border text-foreground rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer hover:bg-background/80">
            <option value="system">System Default</option>
            <option value="dark">Dark Mode</option>
            <option value="light">Light Mode</option>
          </select>
        </div>

        <div className="h-px w-full bg-panel-border/50"></div>

        {/* API Key Setting */}
        <div className="flex flex-col space-y-2 group">
          <label className="text-sm font-medium text-foreground flex items-center gap-2 opacity-80">
            <Key size={16} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
            API Key
          </label>
          <input 
            type="password"
            placeholder="sk-..."
            className="bg-background/50 border border-panel-border text-foreground rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all hover:bg-background/80"
          />
          <p className="text-xs text-gray-500 mt-1">Your API key is stored securely locally.</p>
        </div>

      </div>

      <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-semibold mt-4 shadow-blue-500/20 active:scale-[0.98]">
        <Save size={18} />
        Save Configuration
      </button>
    </div>
  );
}
