import React, { useEffect, useState } from "react";
import { Switch, message, Select } from "antd";
import { Building2, MonitorPlay, Info, Eye } from "lucide-react";

import { useActionPanel } from "../../../contexts/ActionPanelContext";
import "./SystemSettings.css";

export type BroadcastCreationMode = "facility" | "device";

interface SystemSettingsState {
  mode: BroadcastCreationMode;
  timezone: string;
  needApproval: boolean;
}

const DEFAULT_SETTINGS: SystemSettingsState = {
  mode: "facility",
  timezone: "UTC+07:00",
  needApproval: true,
};

const STORAGE_KEY = "mtc_system_settings_v3";

const timezoneOptions = [
  {
    label: "(UTC+07:00) Bangkok, Hanoi, Jakarta",
    value: "UTC+07:00",
  },
  {
    label: "(UTC+08:00) Singapore, Kuala Lumpur, Perth",
    value: "UTC+08:00",
  },
  {
    label: "(UTC+09:00) Tokyo, Seoul",
    value: "UTC+09:00",
  },
  {
    label: "(UTC+00:00) London, Dublin, Lisbon",
    value: "UTC+00:00",
  },
  {
    label: "(UTC-05:00) New York, Toronto",
    value: "UTC-05:00",
  },
];

export const SystemSettings: React.FC = () => {
  const { setActions } = useActionPanel();

  // Dọn dẹp ActionPanel để không còn nút bút chì cũ
  useEffect(() => {
    setActions([]);
    return () => {
      setActions([]);
    };
  }, [setActions]);

  // Baseline đã lưu
  const [savedSettings, setSavedSettings] = useState<SystemSettingsState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  // State đang thao tác trên form
  const [mode, setMode] = useState<BroadcastCreationMode>(savedSettings.mode);
  const [timezone, setTimezone] = useState<string>(savedSettings.timezone);
  const [needApproval, setNeedApproval] = useState<boolean>(savedSettings.needApproval);

  // Chế độ quyền: Cho phép người dùng chuyển đổi để xem trước trạng thái "Chỉ xem"
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

  // Kiểm tra có sự thay đổi so với bản đã lưu hay không
  const hasChanges =
    mode !== savedSettings.mode ||
    timezone !== savedSettings.timezone ||
    needApproval !== savedSettings.needApproval;

  const handleSelectMode = (selectedMode: BroadcastCreationMode) => {
    if (isReadOnly) return;
    setMode(selectedMode);
  };

  const handleTimezoneChange = (val: string) => {
    if (isReadOnly) return;
    setTimezone(val);
  };

  const handleToggleApproval = (checked: boolean) => {
    if (isReadOnly) return;
    setNeedApproval(checked);
  };

  const handleCancel = () => {
    setMode(savedSettings.mode);
    setTimezone(savedSettings.timezone);
    setNeedApproval(savedSettings.needApproval);
    message.info("Đã khôi phục các thiết lập ban đầu.");
  };

  const handleSave = () => {
    if (!hasChanges || isReadOnly) return;

    const newSettings: SystemSettingsState = {
      mode,
      timezone,
      needApproval,
    };

    setSavedSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch {
      // Ignore
    }

    message.success("Lưu thiết lập hệ thống thành công!");
  };

  return (
    <div className="system-settings-page">
      <div className="system-settings-card">
        {/* Header */}
        <div className="system-settings-header">
          <div className="system-settings-header__left">
            <h1 className="system-settings-title">Thiết lập hệ thống</h1>
            <p className="system-settings-subtitle">
              Quản trị thiết lập chung cho toàn bộ hệ thống (dành cho Admin).
            </p>
          </div>

          <div className="system-settings-header__right">
            {/* Chuyển đổi xem thử chế độ quyền */}
            <div className="system-settings-mode-switch" title="Chuyển chế độ xem trước">
              <span>Quyền:</span>
              <button
                type="button"
                className={!isReadOnly ? "active" : ""}
                onClick={() => setIsReadOnly(false)}
              >
                Chỉnh sửa
              </button>
              <button
                type="button"
                className={isReadOnly ? "active" : ""}
                onClick={() => setIsReadOnly(true)}
              >
                Chỉ xem
              </button>
            </div>

            {isReadOnly && (
              <span className="system-settings-readonly-badge">
                <Eye size={15} />
                <span>Chỉ xem</span>
              </span>
            )}
          </div>
        </div>

        {/* Banner cảnh báo quyền khi ở chế độ Chỉ xem */}
        {isReadOnly && (
          <div className="system-settings-alert-banner">
            <Info size={18} className="system-settings-alert-banner__icon" />
            <span className="system-settings-alert-banner__text">
              Bạn chỉ có quyền xem các thiết lập hệ thống. Liên hệ Quản trị viên cấp cao nếu cần yêu cầu chỉnh sửa.
            </span>
          </div>
        )}

        {/* Form Body */}
        <div className="system-settings-form">
          {/* Row 1: Chế độ phát bản tin */}
          <div className="system-settings-form-row">
            <div className="system-settings-form-row__meta">
              <label className="system-settings-form-row__label">
                Chế độ phát bản tin
              </label>
              <span className="system-settings-form-row__desc">
                Quyết định người dùng tạo và phát theo phạm vi cơ sở hay theo từng thiết bị.
              </span>
            </div>

            <div className="broadcast-mode-cards">
              {/* Card 1: Phát theo cơ sở */}
              <div
                className={`broadcast-mode-card ${
                  mode === "facility" ? "broadcast-mode-card--selected" : ""
                } ${isReadOnly ? "broadcast-mode-card--readonly" : ""}`}
                onClick={() => handleSelectMode("facility")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleSelectMode("facility");
                }}
              >
                <div className="broadcast-mode-card__icon-badge">
                  <Building2 size={22} />
                </div>

                <div className="broadcast-mode-card__content">
                  <div className="broadcast-mode-card__title-row">
                    <span className="broadcast-mode-card__title">Phát theo cơ sở</span>
                    {isReadOnly && mode === "facility" && (
                      <span className="broadcast-mode-card__applied-tag">
                        Đang áp dụng
                      </span>
                    )}
                  </div>
                  <p className="broadcast-mode-card__desc">
                    Người dùng chọn một hoặc nhiều cơ sở. Bản tin sẽ phát trên tất cả thiết bị của cơ sở đó.
                  </p>
                </div>

                <div className="broadcast-mode-card__radio">
                  {mode === "facility" && (
                    <div className="broadcast-mode-card__radio-inner" />
                  )}
                </div>
              </div>

              {/* Card 2: Phát theo thiết bị */}
              <div
                className={`broadcast-mode-card ${
                  mode === "device" ? "broadcast-mode-card--selected" : ""
                } ${isReadOnly ? "broadcast-mode-card--readonly" : ""}`}
                onClick={() => handleSelectMode("device")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleSelectMode("device");
                }}
              >
                <div className="broadcast-mode-card__icon-badge">
                  <MonitorPlay size={22} />
                </div>

                <div className="broadcast-mode-card__content">
                  <div className="broadcast-mode-card__title-row">
                    <span className="broadcast-mode-card__title">Phát theo thiết bị</span>
                    {isReadOnly && mode === "device" && (
                      <span className="broadcast-mode-card__applied-tag">
                        Đang áp dụng
                      </span>
                    )}
                  </div>
                  <p className="broadcast-mode-card__desc">
                    Người dùng chọn từng thiết bị cụ thể để phát. Linh hoạt nhưng tốn thời gian hơn.
                  </p>
                </div>

                <div className="broadcast-mode-card__radio">
                  {mode === "device" && (
                    <div className="broadcast-mode-card__radio-inner" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Múi giờ */}
          <div className="system-settings-form-row">
            <div className="system-settings-form-row__meta">
              <label className="system-settings-form-row__label">Múi giờ</label>
              <span className="system-settings-form-row__desc">
                Định dạng thời gian hiển thị và lên lịch phát cho toàn hệ thống.
              </span>
            </div>

            <div className="timezone-select-wrapper">
              <Select
                value={timezone}
                options={timezoneOptions}
                disabled={isReadOnly}
                onChange={handleTimezoneChange}
                size="large"
              />
            </div>
          </div>

          {/* Row 3: Chế độ kiểm duyệt bản tin */}
          <div className="system-settings-form-row">
            <div className="system-settings-form-row__meta">
              <label className="system-settings-form-row__label">
                Chế độ kiểm duyệt bản tin
              </label>
              <span className="system-settings-form-row__desc">
                Bật để mọi bản tin của cơ sở con / thiết bị cần được duyệt trước khi phát sóng.
              </span>
            </div>

            <div className="approval-switch-wrapper">
              <Switch
                checked={needApproval}
                disabled={isReadOnly}
                onChange={handleToggleApproval}
              />
              <span className="approval-switch-label">
                {needApproval ? "Đang bật" : "Đang tắt"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions (Chỉ hiển thị khi có quyền chỉnh sửa) */}
        {!isReadOnly && (
          <div className="system-settings-footer">
            <div className="system-settings-footer__left">
              {hasChanges && (
                <span className="system-settings-footer__note">
                  * Cần lưu để áp dụng thay đổi
                </span>
              )}
            </div>

            <div className="system-settings-footer__actions">
              <button
                type="button"
                className="system-settings-btn system-settings-btn--cancel"
                onClick={handleCancel}
              >
                Hủy
              </button>

              <button
                type="button"
                className="system-settings-btn system-settings-btn--save"
                disabled={!hasChanges}
                onClick={handleSave}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;
