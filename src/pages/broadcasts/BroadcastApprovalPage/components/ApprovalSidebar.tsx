import React from "react";
import { Info } from "lucide-react";
import type { BroadcastApprovalData } from "../types";
import "./ApprovalSidebar.css";

interface ApprovalSidebarProps {
  summary: BroadcastApprovalData["summary"];
  hasUnapprovedMedia: boolean;
  hasNeedsEdit: boolean;
  onApproveAndPlay: () => void;
  onRequestRevision: () => void;
  onReject: () => void;
}

export const ApprovalSidebar: React.FC<ApprovalSidebarProps> = ({
  summary,
  hasUnapprovedMedia,
  hasNeedsEdit,
  onApproveAndPlay,
  onRequestRevision,
  onReject,
}) => {
  return (
    <div className="approval-sidebar">
      {/* Card 1: Thông tin */}
      <div className="approval-sidebar-card">
        <h3 className="approval-sidebar-title">Thông tin</h3>
        <div className="approval-info-list">
          <div className="approval-info-row">
            <span className="approval-info-label">Tên bản tin:</span>
            <span className="approval-info-value">{summary.broadcastName}</span>
          </div>

          <div className="approval-info-row">
            <span className="approval-info-label">Lĩnh vực:</span>
            <span className="approval-info-value">{summary.category}</span>
          </div>

          <div className="approval-info-row">
            <span className="approval-info-label">Nội dung phát:</span>
            <span className="approval-info-value">{summary.content}</span>
          </div>

          <div className="approval-info-row">
            <span className="approval-info-label">Loại bản tin:</span>
            <span className="approval-info-value">{summary.typeLabel}</span>
          </div>

          <div className="approval-info-row">
            <span className="approval-info-label">Thời lượng:</span>
            <span className="approval-info-value">{summary.duration}</span>
          </div>

          <div className="approval-info-row">
            <span className="approval-info-label">Số thiết bị:</span>
            <span className="approval-info-value">{summary.deviceCount}</span>
          </div>

          <div className="approval-info-row">
            <span className="approval-info-label">Ngày phát:</span>
            <span className="approval-info-value">{summary.playDate}</span>
          </div>

          <div className="approval-info-row">
            <span className="approval-info-label">Giờ phát:</span>
            <span className="approval-info-value">{summary.playTime}</span>
          </div>

          <div className="approval-info-row">
            <span className="approval-info-label">Kiểu phát:</span>
            <span className="approval-info-value">{summary.repeatLabel}</span>
          </div>

          <div className="approval-info-row">
            <span className="approval-info-label">Người tạo:</span>
            <span className="approval-info-value">{summary.creator}</span>
          </div>
        </div>
      </div>

      {/* Card 2: Phê duyệt */}
      <div className="approval-sidebar-card">
        <h3 className="approval-sidebar-title">Phê duyệt</h3>

        {hasUnapprovedMedia && (
          <div className="approval-warning-box">
            <Info size={16} className="approval-warning-icon" />
            <p className="approval-warning-text">
              Có 1 media chưa duyệt. “Duyệt và phát” sẽ duyệt luôn các media này cùng bản tin.
            </p>
          </div>
        )}

        <div className="approval-action-buttons">
          <button
            type="button"
            className="approval-btn approval-btn--primary"
            onClick={onApproveAndPlay}
          >
            Duyệt và phát
          </button>

          <button
            type="button"
            className={`approval-btn approval-btn--secondary ${
              hasNeedsEdit ? "approval-btn--revision-active" : ""
            }`}
            onClick={onRequestRevision}
          >
            Trả về chỉnh sửa
          </button>

          <button
            type="button"
            className="approval-btn approval-btn--danger"
            onClick={onReject}
          >
            Từ chối duyệt
          </button>
        </div>

        <p className="approval-helper-note">
          Có mục được đánh dấu “Cần sửa”, nút Trả về chỉnh sửa để yêu cầu chỉnh sửa nội dung.
        </p>
      </div>
    </div>
  );
};

export default ApprovalSidebar;

