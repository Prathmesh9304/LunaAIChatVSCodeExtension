import { Send } from "lucide-react";

interface Props {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSend: () => void;

  providerType: string;
  setProviderType: (value: string) => void;

  selectedModel: string;
  setSelectedModel: (value: string) => void;
}

function ChatInput({
  inputValue,
  setInputValue,
  handleSend,
  providerType,
  setProviderType,
  selectedModel,
  setSelectedModel,
}: Props) {
  return (
    <div className="p-4 border-t border-panel-border bg-side-bar-bg">

      {/* Input section */}

      <div className="flex items-center gap-2 bg-input-bg border border-input-border rounded-xl p-2">

        <input
          type="text"
          value={inputValue}
          placeholder="Ask Luna anything..."
          onChange={(e) =>
            setInputValue(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          className="
            flex-1
            bg-transparent
            outline-none
            px-3
            py-2
          "
        />

        <button
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="
            p-2
            rounded-lg
            hover:bg-background
            disabled:opacity-50
            transition
            cursor-pointer
          "
        >
          <Send size={18}/>
        </button>

      </div>

      {/* Bottom controls */}

      <div className="flex gap-3 mt-3 text-sm">

        {/* Local / Cloud */}

        <select
          value={providerType}
          onChange={(e) =>
            setProviderType(e.target.value)
          }
          className="
            px-3
            py-2
            rounded-lg
            bg-input-bg
            border
            border-panel-border
            outline-none
          "
        >
          <option value="Local">
            Local
          </option>

          <option value="Cloud">
            Cloud
          </option>

        </select>

        {/* Model selection */}

        <select
          value={selectedModel}
          onChange={(e) =>
            setSelectedModel(
              e.target.value
            )
          }
          className="
            flex-1
            px-3
            py-2
            rounded-lg
            bg-input-bg
            border
            border-panel-border
            outline-none
          "
        >

          {providerType === "Local" ? (
            <>
              <option>
                Llama3
              </option>

              <option>
                Mistral-7B
              </option>

              <option>
                DeepSeek
              </option>
            </>
          ) : (
            <>
              <option>
                GPT-4o
              </option>

              <option>
                Claude Sonnet
              </option>

              <option>
                Gemini Pro
              </option>
            </>
          )}

        </select>

      </div>

    </div>
  );
}

export default ChatInput;