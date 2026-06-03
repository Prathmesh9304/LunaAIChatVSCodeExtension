interface Props {
  provider: string;
  selected: string;
  onSelect: (value: string) => void;
}

function ProviderCard({
  provider,
  selected,
  onSelect,
}: Props) {
  return (
    <button
      onClick={() => onSelect(provider)}
      className={`
        w-full
        p-4
        rounded-xl
        border
        transition-all
        text-left
        cursor-pointer
        
        ${
          selected === provider
            ? "bg-primary text-primary-fg border-primary"
            : "bg-input-bg border-panel-border hover:border-primary"
        }
      `}
    >
      {provider}
    </button>
  );
}

export default ProviderCard;