import { useEffect, useState } from "react";
import Header from "../components/Header";
import ChatInput from "../components/ChatInput";
import MessageBubble from "../components/MessageBubble";
import { vscode } from "../utilities/vscode";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  const [providerType, setProviderType] =
    useState("Local");

  const [selectedModel, setSelectedModel] =
    useState("Llama3");

  // Restore previous chat state

  useEffect(() => {
    const state = vscode.getState() as {
      messages?: Message[];
    };

    if (state?.messages) {
      setMessages(state.messages);
    }
  }, []);

  // Save state

  useEffect(() => {
    vscode.setState({
      messages,
    });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
    };

    setMessages((prev) => [
      ...prev,
      newMessage,
    ]);

    setInputValue("");

    // API request logic will be added later
  };

  return (
    <div className="h-screen flex flex-col">

      <Header title="🌙 Luna AI" />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">

            <div className="text-center text-gray-500">

              <div className="text-2xl mb-3">
                🌙
              </div>

              <div className="font-semibold">
                Welcome to Luna
              </div>

              <div className="text-sm mt-2">
                Ask me anything...
              </div>

            </div>

          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              text={msg.text}
              sender={msg.sender}
            />
          ))
        )}

      </div>

      <ChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSend={handleSend}
        providerType={providerType}
        setProviderType={setProviderType}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />

    </div>
  );
}

export default ChatPage;