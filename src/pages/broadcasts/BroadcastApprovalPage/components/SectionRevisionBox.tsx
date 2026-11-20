import React from "react";
import { Flag, X } from "lucide-react";
import "./SectionRevisionBox.css";

interface SectionRevisionBoxProps {
  isNeedsEdit: boolean;
  onToggleNeedsEdit: () => void;
  reasonOptions: string[];
  selectedReasons: string[];
  onToggleReason: (reason: string) => void;
  description: string;
  onChangeDescription: (value: string) => void;
  descriptionPlaceholder?: string;
  prefixTag?: string;
  onRemovePrefixTag?: () => void;
  buttonSize?: "default" | "small";
}

export const SectionRevisionBox: React.FC<SectionRevisionBoxProps> = ({
  isNeedsEdit,
  onToggleNeedsEdit,
  reasonOptions,
  selectedReasons,
  onToggleReason,
  description,
  onChangeDescription,
  descriptionPlaceholder = "Nhập mô tả chi tiết...",
  prefixTag,
  onRemovePrefixTag,
  buttonSize = "default",
}) => {
  return (
    <div className="revision-box">
      <div className="revision-box__trigger">
        <button
          type="button"
          className={`revision-flag-btn ${
            isNeedsEdit ? "revision-flag-btn--active" : ""
          } ${buttonSize === "small" ? "revision-flag-btn--small" : ""}`}
          onClick={onToggleNeedsEdit}
          title={isNeedsEdit ? "Bỏ đánh dấu cần sửa" : "Đánh dấu cần sửa"}
        >
          <Flag size={buttonSize === "small" ? 14 : 16} />
          <span>Cần sửa</span>
        </button>
      </div>

      {isNeedsEdit && (
        <div className="revision-box__content">
          <div className="revision-box__row">
            <span className="revision-box__label">Lý do:</span>
            <div className="revision-box__reasons">
              {reasonOptions.map((reason) => {
                const isSelected = selectedReasons.includes(reason);
                return (
                  <button
                    key={reason}
                    type="button"
                    className={`revision-reason-chip ${
                      isSelected ? "revision-reason-chip--selected" : ""
                    }`}
                    onClick={() => onToggleReason(reason)}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="revision-box__row">
            <span className="revision-box__label">Mô tả chi tiết:</span>
            <div className="revision-box__input-wrapper">
              {prefixTag && (
                <span className="revision-box__prefix-tag">
                  {prefixTag}
                  {onRemovePrefixTag && (
                    <X
                      size={12}
                      className="revision-box__prefix-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemovePrefixTag();
                      }}
                    />
                  )}
                </span>
              )}
              <input
                type="text"
                className="revision-box__input"
                placeholder={descriptionPlaceholder}
                value={description}
                onChange={(e) => onChangeDescription(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionRevisionBox;

