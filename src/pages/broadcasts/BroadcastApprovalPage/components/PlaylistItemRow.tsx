import React from "react";
import { Flag, Play } from "lucide-react";
import type { MediaType, PlaylistItemReview } from "../types";
import "./PlaylistItemRow.css";

interface PlaylistItemRowProps {
  item: PlaylistItemReview;
  isActive: boolean;
  isNeedsEdit: boolean;
  onSelect: () => void;
  onToggleNeedsEdit: (e: React.MouseEvent) => void;
}

const typeLabels: Record<MediaType, string> = {
  video: "Video",
  image: "Hình ảnh",
  template: "Bản mẫu",
  audio: "Audio",
};

export const PlaylistItemRow: React.FC<PlaylistItemRowProps> = ({
  item,
  isActive,
  isNeedsEdit,
  onSelect,
  onToggleNeedsEdit,
}) => {
  return (
    <div
      className={`playlist-item-row ${isActive ? "playlist-item-row--active" : ""}`}
      onClick={onSelect}
    >
      <div className="playlist-item-row__left">
        <div className="playlist-item-row__index">
          {isActive ? (
            <span className="playlist-item-row__active-arrow">
              <Play size={10} fill="#ee6b2d" />
            </span>
          ) : (
            <span>{item.index}</span>
          )}
        </div>

        <div className="playlist-item-row__thumb">
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt={item.title} />
          ) : (
            <div className="playlist-item-row__thumb-placeholder" />
          )}
        </div>

        <div className="playlist-item-row__info">
          <div className="playlist-item-row__title-wrap">
            <span className={`playlist-item-type-badge playlist-item-type-badge--${item.type}`}>
              {typeLabels[item.type]}
            </span>
            <span className="playlist-item-row__title">{item.title}</span>
          </div>

          <div className="playlist-item-row__meta">
            <span>Thời lượng gốc: {item.originalDuration}</span>
            <span className="playlist-item-row__meta-separator">•</span>
            <span>Thời lượng: {item.duration}</span>
          </div>
        </div>
      </div>

      <div className="playlist-item-row__right">
        <button
          type="button"
          className={`revision-flag-btn revision-flag-btn--small ${
            isNeedsEdit ? "revision-flag-btn--active" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleNeedsEdit(e);
          }}
          title={isNeedsEdit ? "Bỏ đánh dấu cần sửa" : "Đánh dấu cần sửa mục này"}
        >
          <Flag size={13} />
          <span>Cần sửa</span>
        </button>
      </div>
    </div>
  );
};

export default PlaylistItemRow;

