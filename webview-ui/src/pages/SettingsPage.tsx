import { useEffect, useState } from "react";
import Header from "../components/Header";
import ProviderCard from "../components/ProviderCard";
import { vscode } from "../utilities/vscode";

function SettingsPage() {
  const providers = [
    "OpenAI",
    "Gemini",
    "Claude",
    "Ollama",
    "LM Studio",
  ];

  const [selectedProvider, setSelectedProvider] =
    useState("OpenAI");

  const [apiKey, setApiKey] =
    useState("");

  useEffect(() => {
    vscode.postMessage({
      type: "getApiKey",
      provider: selectedProvider,
    });

    const listener = (event: MessageEvent) => {
      const message = event.data;

      if (
        message.type === "apiKeyLoaded"
      ) {
        setApiKey(
          message.apiKey || ""
        );
      }
    };

    window.addEventListener(
      "message",
      listener
    );

    return () =>
      window.removeEventListener(
        "message",
        listener
      );

  }, [selectedProvider]);

  const saveApiKey = () => {
    vscode.postMessage({
      type: "saveApiKey",
      provider: selectedProvider,
      apiKey,
    });
  };

  return (
    <div className="h-screen">

      <Header title="⚙ Settings" />

      <div className="p-5 space-y-5">

        <div>

          <div className="font-semibold mb-3">
            Select Provider
          </div>

          <div className="space-y-3">

            {providers.map(
              (provider) => (
                <ProviderCard
                  key={provider}
                  provider={provider}
                  selected={selectedProvider}
                  onSelect={
                    setSelectedProvider
                  }
                />
              )
            )}

          </div>

        </div>

        <div
          className="
          bg-input-bg
          border
          border-panel-border
          rounded-xl
          p-5
          "
        >

          <div className="font-semibold mb-3">

            API Key

          </div>

          <input
            type="password"
            value={apiKey}
            onChange={(e) =>
              setApiKey(
                e.target.value
              )
            }
            placeholder="Enter API key..."
            className="
            w-full
            p-3
            rounded-lg
            bg-background
            border
            border-input-border
            outline-none
            "
          />

          <button
            onClick={saveApiKey}
            className="
            w-full
            mt-4
            p-3
            rounded-lg
            bg-primary
            text-primary-fg
            hover:opacity-90
            "
          >

            Save API Key

          </button>

        </div>

      </div>

    </div>
  );
}

export default SettingsPage;