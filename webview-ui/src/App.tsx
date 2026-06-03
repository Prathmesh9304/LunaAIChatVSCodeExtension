// import { useState, useEffect } from "react";
// import { Send } from "lucide-react";
// import { vscode } from "./utilities/vscode";
// import "./index.css";

// interface Message {
//   id: number;
//   text: string;
//   sender: "user" | "bot";
// }

// function App() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputValue, setInputValue] = useState("");

//   // Restore state on mount
//   useEffect(() => {
//     const state = vscode.getState() as { messages?: Message[] };
//     if (state?.messages) {
//       setMessages(state.messages);
//     }
//   }, []);

//   // Save state when messages change
//   useEffect(() => {
//     vscode.setState({ messages });
//   }, [messages]);

//   const handleSend = () => {
//     if (!inputValue.trim()) return;

//     // Add user message
//     const newMessage: Message = {
//       id: Date.now(),
//       text: inputValue.trim(),
//       sender: "user",
//     };

//     setMessages((prev) => [...prev, newMessage]);
//     setInputValue("");
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") {
//       handleSend();
//     }
//   };

//   return (
//     <main className="flex flex-col h-screen w-full bg-background text-foreground">
//       {/* Header */}
//       <header className="p-3 border-b border-panel-border shadow-sm font-semibold">
//         Luna Chat
//       </header>

//       {/* Messages List */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 focus:outline-none">
//         {messages.length === 0 ? (
//           <div className="text-center text-gray-500 mt-10">
//             Ask me anything...
//           </div>
//         ) : (
//           messages.map((msg) => (
//             <div
//               key={msg.id}
//               className={
//                 "flex w-full " +
//                 (msg.sender === "user" ? "justify-end" : "justify-start")
//               }
//             >
//               <div
//                 className={
//                   "max-w-[85%] px-4 py-2 rounded-lg " +
//                   (msg.sender === "user"
//                     ? "bg-primary text-primary-fg"
//                     : "bg-input-bg border border-panel-border")
//                 }
//               >
//                 {msg.text}
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Input Area */}
//       <div className="p-4 border-t border-panel-border bg-side-bar-bg">
//         <div className="flex items-center gap-2 bg-input-bg border border-input-border rounded-md p-1 focus-within:ring-1 focus-within:ring-primary">
//           <input
//             type="text"
//             className="flex-1 w-full bg-transparent border-none outline-none text-input-fg px-3 py-2 text-sm placeholder:text-gray-500"
//             placeholder="Type a message..."
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             onKeyDown={handleKeyDown}
//           />
//           <button
//             onClick={handleSend}
//             disabled={!inputValue.trim()}
//             className="flex items-center justify-center p-2 rounded-md hover:bg-background text-primary disabled:opacity-50 transition-colors cursor-pointer"
//           >
//             <Send size={18} />
//           </button>
//         </div>
//       </div>
//     </main>
//   );
// }

// export default App;


import { useState } from "react";

import Sidebar from "./components/Sidebar";

import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  const [activePage, setActivePage] =
    useState<
      "chat" | "settings"
    >("chat");

  return (
    <div
      className="
      flex
      h-screen
      bg-background
      text-foreground
      "
    >

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="flex-1">

        {activePage === "chat" ? (
          <ChatPage />
        ) : (
          <SettingsPage />
        )}

      </div>

    </div>
  );
}

export default App;
