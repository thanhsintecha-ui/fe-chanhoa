import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Compass, Plus, X } from "lucide-react";

import Logo from "../../../assets/images/Logo.png";
import "./WelcomeModal.css";

const STORAGE_COMPLETED_KEY = "mtc_welcome_completed";
const STORAGE_SNOOZED_KEY = "mtc_welcome_snoozed";

interface WelcomeModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  forceOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Nếu forceOpen được truyền từ props
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
      return;
    }

    // Kiểm tra query parameter ?welcome=true để hỗ trợ kiểm thử/xem lại
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("welcome") === "true") {
      setIsOpen(true);
      return;
    }

    // Tự động mở nếu chưa hoàn tất và chưa bị tạm ẩn trong phiên
    const isCompleted = localStorage.getItem(STORAGE_COMPLETED_KEY) === "true";
    const isSnoozed = sessionStorage.getItem(STORAGE_SNOOZED_KEY) === "true";

    if (!isCompleted && !isSnoozed) {
      setIsOpen(true);
    }
  }, [forceOpen, location.search]);

  const handleClose = () => {
    sessionStorage.setItem(STORAGE_SNOOZED_KEY, "true");
    setIsOpen(false);
    onClose?.();
  };

  const handleCreateBroadcast = () => {
    localStorage.setItem(STORAGE_COMPLETED_KEY, "true");
    setIsOpen(false);
    onClose?.();
    navigate("/broadcasts/create");
  };

  const handleExplore = () => {
    localStorage.setItem(STORAGE_COMPLETED_KEY, "true");
    setIsOpen(false);
    onClose?.();
    navigate("/dashboard");
  };

  const handleSnooze = () => {
    sessionStorage.setItem(STORAGE_SNOOZED_KEY, "true");
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="welcome-modal-backdrop" onClick={handleClose}>
      <div
        className="welcome-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
      >
        {/* Nút đóng X */}
        <button
          type="button"
          className="welcome-modal-close-btn"
          onClick={handleClose}
          aria-label="Đóng popup"
        >
          <X size={18} />
        </button>

        {/* Header với Logo và thông điệp */}
        <div className="welcome-modal-header">
          <div className="welcome-modal-logo">
            <img src={Logo} alt="MTC Control" />
          </div>
          <h2 id="welcome-modal-title" className="welcome-modal-title">
            Chào mừng đến với MTC Control
          </h2>
          <p className="welcome-modal-desc">
            Một nơi để đưa nội dung lên mọi màn hình trình chiếu của cơ sở. Chọn cách bạn muốn bắt đầu.
          </p>
        </div>

        {/* 2 Thẻ lựa chọn */}
        <div className="welcome-modal-cards">
          {/* Thẻ 1: Đề xuất - Tạo bản tin */}
          <div className="welcome-card welcome-card--featured">
            <div className="welcome-card__header">
              <span className="welcome-card__tag welcome-card__tag--featured">
                ĐỀ XUẤT
              </span>
              <h3 className="welcome-card__title welcome-card__title--featured">
                Tạo bản tin
              </h3>
            </div>

            <p className="welcome-card__desc welcome-card__desc--featured">
              Đi từng bước: chọn nguồn thông tin, chọn thiết bị/ cơ sở, đặt lịch phát.
            </p>

            <button
              type="button"
              className="welcome-card__btn welcome-card__btn--featured"
              onClick={handleCreateBroadcast}
            >
              <span>Bắt đầu tạo</span>
              <ArrowRight size={15} />
            </button>

            {/* Watermark mờ dấu + */}
            <div className="welcome-card__watermark welcome-card__watermark--plus">
              <Plus size={80} strokeWidth={2.5} />
            </div>
          </div>

          {/* Thẻ 2: Tự do - Tự khám phá */}
          <div className="welcome-card welcome-card--secondary">
            <div className="welcome-card__header">
              <span className="welcome-card__tag welcome-card__tag--secondary">
                KHÁM PHÁ THEO Ý CỦA BẠN
              </span>
              <h3 className="welcome-card__title welcome-card__title--secondary">
                Tự khám phá
              </h3>
            </div>

            <p className="welcome-card__desc welcome-card__desc--secondary">
              Xem tổng quan hệ thống, dashboard, thiết bị, nguồn thông tin và bản tin
            </p>

            <button
              type="button"
              className="welcome-card__btn welcome-card__btn--secondary"
              onClick={handleExplore}
            >
              <span>Vào ứng dụng</span>
              <ArrowRight size={15} />
            </button>

            {/* Watermark mờ la bàn */}
            <div className="welcome-card__watermark welcome-card__watermark--compass">
              <Compass size={64} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Nút Nhắc lại lần sau */}
        <div className="welcome-modal-footer">
          <button
            type="button"
            className="welcome-modal-snooze-btn"
            onClick={handleSnooze}
          >
            Nhắc lại lần sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;

