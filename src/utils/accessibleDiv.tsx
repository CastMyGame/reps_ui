import React from "react";

interface AccessibleDivProps {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  tabIndex?: number;
  role?: 'button' | 'link' | (string & {});
}

/**
 * AccessibleDiv behaves like a button using a <div> element.
 * It supports keyboard interaction (Enter/Space) and screen readers.
 */
export const AccessibleDiv: React.FC<AccessibleDivProps> = ({
  onClick,
  className = "",
  children,
  ariaLabel,
  tabIndex = 0,
  role = "button",
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={role}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </div>
  );
};