import React from "react";

export type MdSwitchProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** 접근성: 라벨이 비어 있을 때 사용 */
  ariaLabel?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  /** 표 헤더에 라벨이 있을 때 트랙만 표시 */
  compact?: boolean;
};

/**
 * material-layout.css 의 `.md-switch` 스타일을 사용합니다. 상위에 `.md-wrap` 이 있어야 합니다.
 */
export default function MdSwitch({ id, checked, onChange, disabled, ariaLabel, icon, children, compact }: MdSwitchProps) {
  return (
    <label
      htmlFor={id}
      className={`md-switch${disabled ? " md-switch--disabled" : ""}${compact ? " md-switch--compact" : ""}`}
    >
      <input
        id={id}
        className="md-switch__input"
        type="checkbox"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="md-switch__track" aria-hidden>
        <span className="md-switch__thumb" />
      </span>
      {!compact && (
        <span className="md-switch__label">
          {icon ? <span className="md-switch__icon">{icon}</span> : null}
          {children}
        </span>
      )}
    </label>
  );
}
