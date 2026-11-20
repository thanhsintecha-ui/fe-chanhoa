import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message, Modal } from "antd";
import {
  ChevronLeft,
  Info as InfoIcon,
  List,
  Store,
  Calendar,
  Play,
  Pause,
  Volume2,
  Maximize2,
} from "lucide-react";

import { MOCK_BROADCAST_APPROVAL } from "./data";
import type { SectionRevisionState } from "./types";
import SectionRevisionBox from "./components/SectionRevisionBox";
import PlaylistItemRow from "./components/PlaylistItemRow";
import ApprovalSidebar from "./components/ApprovalSidebar";

import { ROUTES } from "../../../constants/route.constants";
import "./BroadcastApprovalPage.css";

export const BroadcastApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Mock data bản tin
  const broadcast = MOCK_BROADCAST_APPROVAL;

  // Quản lý item active trong playlist
  const [activeItemId, setActiveItemId] = useState<string>("item-2");

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(22); // ~00:56 trong 04:12

  // State đánh dấu cần sửa cho từng section
  const [infoRevision, setInfoRevision] = useState<SectionRevisionState>({
    isNeedsEdit: false,
    selectedReasons: [],
    description: "",
  });

  const [contentRevision, setContentRevision] = useState<SectionRevisionState>({
    isNeedsEdit: true, // Mặc định mở như trong ảnh thiết kế mẫu
    selectedReasons: ["Sai thời lượng"],
    description: "cần sửa lại thời lượng trong bản tin thành 30 giây",
  });

  const [activeSubItemPrefix, setActiveSubItemPrefix] = useState<string | undefined>(
    "4 Những điều nhỏ bé làm...",
  );

  const [facilitiesRevision, setFacilitiesRevision] = useState<SectionRevisionState>({
    isNeedsEdit: false,
    selectedReasons: [],
    description: "",
  });

  const [scheduleRevision, setScheduleRevision] = useState<SectionRevisionState>({
    isNeedsEdit: false,
    selectedReasons: [],
    description: "",
  });

  // Modal xác nhận thao tác
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: "approve" | "revision" | "reject";
    title: string;
    content: string;
  }>({
    open: false,
    type: "approve",
    title: "",
    content: "",
  });

  // Kiểm tra có section nào đang được đánh dấu cần sửa không
  const hasNeedsEdit =
    infoRevision.isNeedsEdit ||
    contentRevision.isNeedsEdit ||
    facilitiesRevision.isNeedsEdit ||
    scheduleRevision.isNeedsEdit;

  // Toggle lý do nhanh
  const toggleReason = (
    currentReasons: string[],
    reason: string,
    setter: React.Dispatch<React.SetStateAction<SectionRevisionState>>,
  ) => {
    setter((prev) => {
      const exists = prev.selectedReasons.includes(reason);
      return {
        ...prev,
        selectedReasons: exists
          ? prev.selectedReasons.filter((r) => r !== reason)
          : [...prev.selectedReasons, reason],
      };
    });
  };

  // Toggle item cần sửa trong playlist
  const handleToggleItemNeedsEdit = (itemId: string, itemTitle: string, itemIndex: number) => {
    setContentRevision((prev) => ({
      ...prev,
      isNeedsEdit: true,
    }));
    setActiveSubItemPrefix(`${itemIndex} ${itemTitle.slice(0, 20)}...`);
  };

  // Xử lý các nút hành động
  const handleApproveAndPlay = () => {
    setConfirmModal({
      open: true,
      type: "approve",
      title: "Xác nhận duyệt và phát bản tin",
      content:
        "Hệ thống sẽ đồng thời duyệt các media đính kèm và kích hoạt phát sóng bản tin này theo lịch đã thiết lập. Bạn có chắc chắn muốn tiếp tục?",
    });
  };

  const handleRequestRevision = () => {
    if (!hasNeedsEdit) {
      message.warning("Vui lòng đánh dấu 'Cần sửa' và nhập nội dung cần chỉnh sửa trước khi gửi yêu cầu.");
      return;
    }

    setConfirmModal({
      open: true,
      type: "revision",
      title: "Yêu cầu chỉnh sửa bản tin",
      content:
        "Bản tin sẽ được chuyển về trạng thái yêu cầu chỉnh sửa kèm toàn bộ các ghi chú góp ý của bạn. Người tạo sẽ nhận được thông báo để cập nhật.",
    });
  };

  const handleReject = () => {
    setConfirmModal({
      open: true,
      type: "reject",
      title: "Từ chối duyệt bản tin",
      content:
        "Bạn có chắc chắn muốn từ chối duyệt bản tin này không? Bản tin sẽ không được phát sóng trên hệ thống.",
    });
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === "approve") {
      message.success("Bản tin đã được phê duyệt và sẵn sàng phát sóng!");
    } else if (confirmModal.type === "revision") {
      message.success("Đã gửi yêu cầu chỉnh sửa bản tin thành công!");
    } else {
      message.error("Đã từ chối duyệt bản tin!");
    }
    setConfirmModal((prev) => ({ ...prev, open: false }));
    navigate(ROUTES.BROADCASTS);
  };

  return (
    <div className="broadcast-approval-page">
      {/* Page Header */}
      <div className="broadcast-approval-header">
        <button
          type="button"
          className="broadcast-approval-back-btn"
          onClick={() => navigate(ROUTES.BROADCASTS)}
          aria-label="Quay lại danh sách bản tin"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="broadcast-approval-page-title">Phê duyệt bản tin</h1>
        {broadcast.isPriority && (
          <span className="broadcast-priority-tag">{broadcast.priorityLabel}</span>
        )}
      </div>

      {/* Main Grid: Left content (cards) & Right sidebar */}
      <div className="broadcast-approval-layout">
        <div className="broadcast-approval-main">
          {/* Section 1: Thông tin chung */}
          <div className="approval-section-card">
            <div className="approval-section-card__top">
              <div className="approval-section-card__identity">
                <div className="approval-section-card__icon-badge">
                  <InfoIcon size={20} color="#ee6b2d" />
                </div>
                <div className="approval-section-card__text-group">
                  <div className="approval-section-card__subtitle">Tiêu đề</div>
                  <h2 className="approval-section-card__title">{broadcast.title}</h2>
                  <div className="approval-section-card__meta-inline">
                    <span>
                      Mã bản tin: <strong>{broadcast.code}</strong>
                    </span>
                    <span className="approval-meta-divider">•</span>
                    <span>
                      Lĩnh vực: <strong>{broadcast.category}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <SectionRevisionBox
                isNeedsEdit={infoRevision.isNeedsEdit}
                onToggleNeedsEdit={() =>
                  setInfoRevision((prev) => ({ ...prev, isNeedsEdit: !prev.isNeedsEdit }))
                }
                reasonOptions={["Sai tiêu đề", "Sai mã bản tin", "Sai lĩnh vực"]}
                selectedReasons={infoRevision.selectedReasons}
                onToggleReason={(r) => toggleReason(infoRevision.selectedReasons, r, setInfoRevision)}
                description={infoRevision.description}
                onChangeDescription={(val) =>
                  setInfoRevision((prev) => ({ ...prev, description: val }))
                }
                descriptionPlaceholder='Ví dụ: Đổi tên bản tin thành "Chào buổi sáng"'
              />
            </div>
          </div>

          {/* Section 2: Trình phát Video Preview */}
          <div className="approval-section-card approval-video-card">
            <div className="approval-video-player">
              <div className="approval-video-screen">
                <img
                  src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80"
                  alt="Video Preview"
                  className="approval-video-preview-img"
                />
                <button
                  type="button"
                  className="approval-video-center-play-btn"
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label="Phát video"
                >
                  {isPlaying ? <Pause size={28} /> : <Play size={28} fill="#ffffff" />}
                </button>
              </div>

              <div className="approval-video-controls">
                <button
                  type="button"
                  className="approval-video-control-btn"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} fill="#ffffff" />}
                </button>

                <div
                  className="approval-video-scrubber"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    setVideoProgress(Math.round((clickX / rect.width) * 100));
                  }}
                >
                  <div
                    className="approval-video-scrubber-progress"
                    style={{ width: `${videoProgress}%` }}
                  />
                  <div
                    className="approval-video-scrubber-thumb"
                    style={{ left: `${videoProgress}%` }}
                  />
                </div>

                <span className="approval-video-time">00:56 / 04:12</span>

                <button type="button" className="approval-video-control-btn">
                  <Volume2 size={16} />
                </button>

                <button type="button" className="approval-video-control-btn">
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Nội dung (Danh sách phát & items) */}
          <div className="approval-section-card">
            <div className="approval-section-card__top">
              <div className="approval-section-card__identity">
                <div className="approval-section-card__icon-badge">
                  <List size={20} color="#ee6b2d" />
                </div>
                <div className="approval-section-card__text-group">
                  <div className="approval-section-card__subtitle">Danh sách phát</div>
                  <h2 className="approval-section-card__title">{broadcast.playlist.name}</h2>
                  <div className="approval-section-card__meta-inline">
                    <span>Thời lượng: <strong>{broadcast.playlist.duration}</strong></span>
                    <span className="approval-meta-divider">•</span>
                    <span>Kiểu phát: <strong>{broadcast.playlist.playMode}</strong></span>
                    <span className="approval-meta-divider">•</span>
                    <span>Lĩnh vực: <strong>{broadcast.playlist.category}</strong></span>
                  </div>
                </div>
              </div>

              <SectionRevisionBox
                isNeedsEdit={contentRevision.isNeedsEdit}
                onToggleNeedsEdit={() =>
                  setContentRevision((prev) => ({ ...prev, isNeedsEdit: !prev.isNeedsEdit }))
                }
                reasonOptions={["Sai thời lượng", "Sai tên danh sách", "Sai thành phần"]}
                selectedReasons={contentRevision.selectedReasons}
                onToggleReason={(r) => toggleReason(contentRevision.selectedReasons, r, setContentRevision)}
                description={contentRevision.description}
                onChangeDescription={(val) =>
                  setContentRevision((prev) => ({ ...prev, description: val }))
                }
                prefixTag={activeSubItemPrefix}
                onRemovePrefixTag={() => setActiveSubItemPrefix(undefined)}
                descriptionPlaceholder="Nhập mô tả chi tiết cần sửa cho danh sách..."
              />
            </div>

            {/* Danh sách các item con trong Playlist */}
            <div className="approval-playlist-items-list">
              {broadcast.playlist.items.map((item) => (
                <PlaylistItemRow
                  key={item.id}
                  item={item}
                  isActive={activeItemId === item.id}
                  isNeedsEdit={activeSubItemPrefix?.startsWith(String(item.index)) ?? false}
                  onSelect={() => setActiveItemId(item.id)}
                  onToggleNeedsEdit={() =>
                    handleToggleItemNeedsEdit(item.id, item.title, item.index)
                  }
                />
              ))}
            </div>
          </div>

          {/* Section 4: Cơ sở */}
          <div className="approval-section-card">
            <div className="approval-section-card__top">
              <div className="approval-section-card__identity">
                <div className="approval-section-card__icon-badge">
                  <Store size={20} color="#ee6b2d" />
                </div>
                <div className="approval-section-card__text-group">
                  <div className="approval-section-card__subtitle">Cơ sở</div>
                  <div className="approval-facilities-list">
                    {broadcast.facilities.join(", ")}
                  </div>
                </div>
              </div>

              <SectionRevisionBox
                isNeedsEdit={facilitiesRevision.isNeedsEdit}
                onToggleNeedsEdit={() =>
                  setFacilitiesRevision((prev) => ({ ...prev, isNeedsEdit: !prev.isNeedsEdit }))
                }
                reasonOptions={["Sai cơ sở", "Thiếu cơ sở"]}
                selectedReasons={facilitiesRevision.selectedReasons}
                onToggleReason={(r) => toggleReason(facilitiesRevision.selectedReasons, r, setFacilitiesRevision)}
                description={facilitiesRevision.description}
                onChangeDescription={(val) =>
                  setFacilitiesRevision((prev) => ({ ...prev, description: val }))
                }
                descriptionPlaceholder="Ví dụ: Thêm cơ sở A"
              />
            </div>
          </div>

          {/* Section 5: Lịch phát */}
          <div className="approval-section-card">
            <div className="approval-section-card__top">
              <div className="approval-section-card__identity">
                <div className="approval-section-card__icon-badge">
                  <Calendar size={20} color="#ee6b2d" />
                </div>
                <div className="approval-section-card__text-group">
                  <div className="approval-schedule-grid">
                    <div className="approval-schedule-col">
                      <div className="approval-schedule-item">
                        <span className="approval-schedule-label">Ngày phát:</span>
                        <span className="approval-schedule-value">{broadcast.schedule.dateRange}</span>
                      </div>
                      <div className="approval-schedule-item">
                        <span className="approval-schedule-label">Kiểu lặp:</span>
                        <span className="approval-schedule-value">{broadcast.schedule.repeatType}</span>
                      </div>
                    </div>

                    <div className="approval-schedule-col">
                      <div className="approval-schedule-item">
                        <span className="approval-schedule-label">Giờ phát:</span>
                        <span className="approval-schedule-value">{broadcast.schedule.timeRange}</span>
                      </div>
                      <div className="approval-schedule-item">
                        <span className="approval-schedule-label">Ngày lặp:</span>
                        <span className="approval-schedule-value">{broadcast.schedule.repeatDays}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <SectionRevisionBox
                isNeedsEdit={scheduleRevision.isNeedsEdit}
                onToggleNeedsEdit={() =>
                  setScheduleRevision((prev) => ({ ...prev, isNeedsEdit: !prev.isNeedsEdit }))
                }
                reasonOptions={["Sai ngày phát", "Sai giờ phát", "Sai kiểu lặp", "Sai ngày lặp"]}
                selectedReasons={scheduleRevision.selectedReasons}
                onToggleReason={(r) => toggleReason(scheduleRevision.selectedReasons, r, setScheduleRevision)}
                description={scheduleRevision.description}
                onChangeDescription={(val) =>
                  setScheduleRevision((prev) => ({ ...prev, description: val }))
                }
                descriptionPlaceholder="Ví dụ: Đổi ngày phát thành ngày 31"
              />
            </div>
          </div>
        </div>

        {/* Cột phải: Sidebar Thông tin & Phê duyệt */}
        <div className="broadcast-approval-sidebar">
          <ApprovalSidebar
            summary={broadcast.summary}
            hasUnapprovedMedia={broadcast.hasUnapprovedMedia}
            hasNeedsEdit={hasNeedsEdit}
            onApproveAndPlay={handleApproveAndPlay}
            onRequestRevision={handleRequestRevision}
            onReject={handleReject}
          />
        </div>
      </div>

      {/* Modal xác nhận */}
      <Modal
        title={confirmModal.title}
        open={confirmModal.open}
        onOk={handleConfirmAction}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          style: {
            backgroundColor: confirmModal.type === "reject" ? "#ff4d4f" : "#ee6b2d",
            borderColor: confirmModal.type === "reject" ? "#ff4d4f" : "#ee6b2d",
          },
        }}
      >
        <p>{confirmModal.content}</p>
      </Modal>
    </div>
  );
};

export default BroadcastApprovalPage;

