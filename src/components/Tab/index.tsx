import "./styles.scss";

export const Tab = ({ label, isSelected, onClick }: { label: string; isSelected: boolean; onClick: () => void }) => {
  return (
    <div className={`Tab ${isSelected ? "Tab--selected" : ""}`} onClick={onClick}>
      {label}
    </div>
  );
};
