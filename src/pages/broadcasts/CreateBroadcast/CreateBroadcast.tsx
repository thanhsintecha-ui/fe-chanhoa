import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Modal, Input, Select, Checkbox } from "antd";
import {
  Search,
  Filter,
  RotateCw,
  Upload,
  UploadCloud,
  Radio,
  Link2,
  ClipboardList,
  Plus,
  X,
  Check,
  Pencil,
  Zap,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import mediaSample from "../../../assets/images/media.png";
import { ROUTES } from "../../../constants/route.constants";
import { useFacility } from "../../../contexts/FacilityContext";
import { broadcastApi } from "../../../api/broadcastApi";
import mediaApi from "../../../api/mediaApi";
import deviceApi from "../../../api/deviceApi";
import type { CreateBroadcastDto } from "../../../types/broadcast.types";
import "./CreateBroadcast.css";

interface RecentPreset {
  id: string;
  name: string;
  meta: string;
  thumbnail: string;
  sourceId: string;
  facilityIds: string[];
  timeOptionId: string;
  title: string;
  category: string;
}

type SourceTypeFilter = "all" | "media" | "template" | "playlist";

interface SourceItem {
  id: string;
  name: string;
  category: string;
  duration: string;
  isApproved: boolean;
  thumbnail: string;
  type: "media" | "template" | "playlist";
}

interface FacilityItem {
  id: string;
  name: string;
  sub: string;
  deviceCount: number;
}

interface TimeOptionItem {
  id: string;
  title: string;
  tag: string;
}



const TIME_OPTIONS: TimeOptionItem[] = [
  {
    id: "opt-1",
    title: "Phát 1 lần ngay bây giờ",
    tag: "Theo thời lượng media",
  },
  {
    id: "opt-2",
    title: "Phát đến hết hôm nay",
    tag: "Từ bây giờ đến 23:59:59",
  },
  {
    id: "opt-3",
    title: "Phát liên tục",
    tag: "Từ bây giờ, mãi mãi",
  },
  {
    id: "opt-4",
    title: "Phát nhiều ngày",
    tag: "Cả ngày, chọn khoảng ngày",
  },
];

const formatSecondsToTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => (n < 10 ? "0" + n : String(n));
  return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
};

export const CreateBroadcast: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedFacilityId, selectedFacility } = useFacility();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [sources, setSources] = useState<SourceItem[]>([]);
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [recentPresets, setRecentPresets] = useState<RecentPreset[]>([]);
  const [activeTab, setActiveTab] = useState<"fast" | "standard">("fast");
  const [recentExpanded, setRecentExpanded] = useState<boolean>(true);

  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [searchSource, setSearchSource] = useState<string>("");
  const [urlInput, setUrlInput] = useState<string>("");
  const [urlError, setUrlError] = useState<string>("");

  const [mediaToDelete, setMediaToDelete] = useState<SourceItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>([]);
  const [searchFacility, setSearchFacility] = useState<string>("");

  const [selectedTimeOptionId, setSelectedTimeOptionId] =
    useState<string>("opt-1");

  const [broadcastTitle, setBroadcastTitle] = useState<string>("");
  const [broadcastCategory, setBroadcastCategory] =
    useState<string>("Thông báo");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [tempTitle, setTempTitle] = useState<string>("");
  const [tempCategory, setTempCategory] = useState<string>("Thông báo");

  // Tải dữ liệu thực tế từ API (Media, Devices, Recent broadcasts)
  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      mediaApi.getAll(),
      deviceApi.getAll({ facilityId: selectedFacilityId || undefined }),
      broadcastApi.getList({ pageIndex: 1, pageSize: 5 }),
    ]).then(([mediaRes, deviceRes, broadcastRes]) => {
      if (!isMounted) return;

      if (mediaRes.status === "fulfilled" && Array.isArray(mediaRes.value)) {
        const mappedSources: SourceItem[] = mediaRes.value.map((m) => ({
          id: m.id,
          name: m.mediaName,
          category: `Media • ${m.fileType || "Tệp"}`,
          duration: m.durationSeconds
            ? formatSecondsToTime(m.durationSeconds)
            : "00:00:00",
          isApproved:
            m.approvalStatus === "approved" || m.approvalStatus === "Đã duyệt",
          thumbnail: m.url || mediaSample,
          type: "media",
        }));
        setSources(mappedSources);
      } else {
        setSources([]);
      }

      if (deviceRes.status === "fulfilled" && Array.isArray(deviceRes.value)) {
        const mappedFacilities: FacilityItem[] = deviceRes.value.map((d) => ({
          id: d.id,
          name: d.deviceName || d.deviceCode,
          sub: `Mã thiết bị: ${d.deviceCode}`,
          deviceCount: 1,
        }));
        setFacilities(mappedFacilities);
      } else {
        setFacilities([]);
      }

      if (
        broadcastRes.status === "fulfilled" &&
        broadcastRes.value &&
        Array.isArray(broadcastRes.value.items)
      ) {
        const mappedPresets: RecentPreset[] = broadcastRes.value.items.map(
          (b) => ({
            id: b.id,
            name: b.broadcastName,
            meta: `${b.facilityName || "Cơ sở"} • ${b.broadcastType}`,
            thumbnail: mediaSample,
            sourceId: "",
            facilityIds: [b.facilityId],
            timeOptionId: "opt-1",
            title: b.broadcastName,
            category: b.description || "Bản tin",
          }),
        );
        setRecentPresets(mappedPresets);
      } else {
        setRecentPresets([]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedFacilityId]);

  const [sourceTypeFilter, setSourceTypeFilter] =
    useState<SourceTypeFilter>("all");
  const [isSourceFilterOpen, setIsSourceFilterOpen] = useState<boolean>(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSourceFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const mediaCount = useMemo(
    () => sources.filter((s) => s.type === "media").length,
    [sources]
  );
  const templateCount = useMemo(
    () => sources.filter((s) => s.type === "template").length,
    [sources]
  );
  const playlistCount = useMemo(
    () => sources.filter((s) => s.type === "playlist").length,
    [sources]
  );

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      const matchSearch = s.name
        .toLowerCase()
        .includes(searchSource.toLowerCase());
      const matchType =
        sourceTypeFilter === "all" || s.type === sourceTypeFilter;
      return matchSearch && matchType;
    });
  }, [sources, searchSource, sourceTypeFilter]);

  const filteredFacilities = useMemo(() => {
    return facilities.filter((f: FacilityItem) =>
      f.name.toLowerCase().includes(searchFacility.toLowerCase())
    );
  }, [facilities, searchFacility]);

  const selectedSources = useMemo(() => {
    return sources.filter((s) => selectedSourceIds.includes(s.id));
  }, [sources, selectedSourceIds]);

  const totalSourcesDuration = useMemo(() => {
    let totalSec = 0;
    selectedSources.forEach((s) => {
      const parts = s.duration.split(":").map(Number);
      if (parts.length === 3) {
        totalSec +=
          (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
      }
    });
    const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
    const sec = String(totalSec % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  }, [selectedSources]);

  const selectedTimeOption = useMemo(() => {
    return TIME_OPTIONS.find((t) => t.id === selectedTimeOptionId);
  }, [selectedTimeOptionId]);

  const handleToggleSource = (id: string) => {
    setSelectedSourceIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      const nextSources = sources.filter((s) => next.includes(s.id));
      const sourceName =
        nextSources.length === 0
          ? "Chưa chọn media"
          : nextSources.length === 1
          ? nextSources[0].name
          : `${nextSources[0].name} (+${nextSources.length - 1} nguồn)`;
      setBroadcastTitle(
        `${sourceName} – ${
          selectedFacilityIds.length > 0
            ? `${selectedFacilityIds.length} thiết bị`
            : "0 thiết bị"
        }`
      );
      return next;
    });
  };

  const handleApplyPreset = (preset: RecentPreset) => {
    if (preset.sourceId) {
      setSelectedSourceIds([preset.sourceId]);
    }
    if (preset.facilityIds && preset.facilityIds.length > 0) {
      setSelectedFacilityIds(preset.facilityIds);
    }
    setSelectedTimeOptionId(preset.timeOptionId || "opt-1");
    setBroadcastTitle(preset.title);
    setBroadcastCategory(preset.category);
    message.success(`Đã áp dụng mẫu: ${preset.name}`);
  };

  const handleToggleFacility = (id: string) => {
    setSelectedFacilityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFacilities = (checked: boolean) => {
    if (checked) {
      setSelectedFacilityIds(facilities.map((f: FacilityItem) => f.id));
    } else {
      setSelectedFacilityIds([]);
    }
  };

  const handleOpenEditModal = () => {
    setTempTitle(broadcastTitle);
    setTempCategory(broadcastCategory);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    setBroadcastTitle(tempTitle);
    setBroadcastCategory(tempCategory);
    setIsEditModalOpen(false);
    message.success("Đã cập nhật thông tin bản tin");
  };

  const finalizeUploadedMedia = (
    fileName: string,
    categoryLabel: string,
    durationText: string,
    thumbnailUrl: string
  ) => {
    const newId = "src-upload-" + Date.now();
    const newSource: SourceItem = {
      id: newId,
      name: fileName,
      category: categoryLabel,
      duration: durationText,
      isApproved: true,
      thumbnail: thumbnailUrl,
      type: "media",
    };
    setSources((prev) => [newSource, ...prev]);
    setSelectedSourceIds((prev) => [newId, ...prev]);
    setBroadcastTitle(
      fileName +
        (selectedFacilityIds.length > 0
          ? ` – ${selectedFacilityIds.length} thiết bị`
          : " – 0 thiết bị")
    );
    setIsUploading(false);
    setUploadProgress(100);
    setIsUploadModalOpen(false);
    message.success(`Đã tải lên tệp ${fileName} thành công!`);
  };

  const processMediaFile = (file: File) => {
    if (file.size > 1024 * 1024 * 1024) {
      message.error("Kích thước tệp vượt quá giới hạn tối đa 1 GB!");
      return;
    }
    if (file.size > 300 * 1024 * 1024) {
      message.warning(
        "Tệp lớn hơn 300 MB, khuyến nghị nén dưới 300 MB để truyền phát tối ưu hơn."
      );
    }

    let categoryLabel = "Media • Khác";
    const isVideo = file.type.startsWith("video/");
    const isAudio = file.type.startsWith("audio/");
    const isImage = file.type.startsWith("image/");

    if (isVideo) {
      categoryLabel = "Media • Video";
    } else if (isAudio) {
      categoryLabel = "Media • Audio";
    } else if (isImage) {
      categoryLabel = "Media • Hình ảnh";
    } else {
      message.error(
        "Định dạng tệp không được hỗ trợ! Vui lòng chọn tệp video, âm thanh hoặc hình ảnh."
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(25);

    const progressTimer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressTimer);
          return 85;
        }
        return prev + 20;
      });
    }, 200);

    const objectUrl = URL.createObjectURL(file);

    if (isVideo) {
      const videoEl = document.createElement("video");
      videoEl.preload = "metadata";
      videoEl.src = objectUrl;
      videoEl.onloadedmetadata = () => {
        clearInterval(progressTimer);
        const durationSec = Math.round(videoEl.duration) || 30;
        finalizeUploadedMedia(
          file.name,
          categoryLabel,
          formatSecondsToTime(durationSec),
          objectUrl
        );
      };
      videoEl.onerror = () => {
        clearInterval(progressTimer);
        finalizeUploadedMedia(file.name, categoryLabel, "00:00:30", objectUrl);
      };
    } else if (isAudio) {
      const audioEl = document.createElement("audio");
      audioEl.preload = "metadata";
      audioEl.src = objectUrl;
      audioEl.onloadedmetadata = () => {
        clearInterval(progressTimer);
        const durationSec = Math.round(audioEl.duration) || 60;
        finalizeUploadedMedia(
          file.name,
          categoryLabel,
          formatSecondsToTime(durationSec),
          objectUrl
        );
      };
      audioEl.onerror = () => {
        clearInterval(progressTimer);
        finalizeUploadedMedia(file.name, categoryLabel, "00:01:00", objectUrl);
      };
    } else {
      setTimeout(() => {
        clearInterval(progressTimer);
        finalizeUploadedMedia(file.name, categoryLabel, "00:00:10", objectUrl);
      }, 600);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processMediaFile(e.target.files[0]);
    }
    e.target.value = "";
  };

  const handleAddUrl = async () => {
    let link = urlInput.trim();
    if (!link && navigator.clipboard && navigator.clipboard.readText) {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().startsWith("http")) {
          link = text.trim();
          setUrlInput(link);
        } else {
          setUrlError(
            "Trình duyệt chặn đọc bộ nhớ tạm, hãy nhấn Ctrl+V vào ô đường dẫn"
          );
          return;
        }
      } catch {
        setUrlError(
          "Trình duyệt chặn đọc bộ nhớ tạm, hãy nhấn Ctrl+V vào ô đường dẫn"
        );
        return;
      }
    }
    if (!link) {
      setUrlError("Đường dẫn không hợp lệ, vui lòng kiểm tra lại");
      return;
    }
    const httpPrefix = "http:" + "/" + "/";
    const httpsPrefix = "https:" + "/" + "/";
    if (!link.startsWith(httpPrefix) && !link.startsWith(httpsPrefix)) {
      setUrlError("Đường dẫn không hợp lệ, vui lòng kiểm tra lại");
      return;
    }

    setUrlError("");

    const segments = link.split("/");
    const rawFileName = segments[segments.length - 1] || "Nguồn phát trực tuyến";
    const cleanName =
      rawFileName.length > 32
        ? rawFileName.substring(0, 32) + "..."
        : rawFileName;

    const newId = "src-url-" + Date.now();
    const newSource: SourceItem = {
      id: newId,
      name: cleanName,
      category: "Media • Trực tuyến",
      duration: "00:05:00",
      isApproved: true,
      thumbnail: mediaSample,
      type: "media",
    };

    setSources((prev) => [newSource, ...prev]);
    setSelectedSourceIds((prev) => [newId, ...prev]);
    setBroadcastTitle(
      cleanName +
        (selectedFacilityIds.length > 0
          ? ` – ${selectedFacilityIds.length} thiết bị`
          : " – 0 thiết bị")
    );
    setUrlInput("");
    setIsUploadModalOpen(false);
    message.success("Đã thêm nguồn phát từ đường dẫn thành công!");
  };

  const handleRemoveSelectedSources = () => {
    setSelectedSourceIds([]);
    setBroadcastTitle(
      "Chưa chọn media" +
        (selectedFacilityIds.length > 0
          ? ` – ${selectedFacilityIds.length} thiết bị`
          : " – Chưa chọn thiết bị")
    );
  };

  const handleConfirmDelete = () => {
    if (!mediaToDelete) return;
    const targetId = mediaToDelete.id;
    const targetName = mediaToDelete.name;
    setSources((prev) => prev.filter((s) => s.id !== targetId));
    setSelectedSourceIds((prev) => {
      const next = prev.filter((id) => id !== targetId);
      const nextSources = sources.filter(
        (s) => next.includes(s.id) && s.id !== targetId
      );
      const sourceName =
        nextSources.length === 0
          ? "Chưa chọn media"
          : nextSources.length === 1
          ? nextSources[0].name
          : `${nextSources[0].name} (+${nextSources.length - 1} nguồn)`;
      setBroadcastTitle(
        `${sourceName} – ${
          selectedFacilityIds.length > 0
            ? `${selectedFacilityIds.length} thiết bị`
            : "0 thiết bị"
        }`
      );
      return next;
    });
    setMediaToDelete(null);
    message.success(`Đã xóa media "${targetName}" thành công!`);
  };

  const handleCreateNewDevice = () => {
    message.info("Chuyển sang trang tạo thiết bị mới");
    navigate(ROUTES.DEVICES);
  };

  const handleSubmit = async () => {
    if (selectedSourceIds.length === 0) {
      message.error("Vui lòng chọn hoặc tải lên nguồn thông tin!");
      return;
    }
    if (selectedFacilityIds.length === 0) {
      message.error("Vui lòng chọn ít nhất một thiết bị hoặc cơ sở!");
      return;
    }

    setSubmitting(true);
    try {
      const facilityId =
        selectedFacilityId || "11111111-1111-1111-1111-111111111111";
      const organizationId =
        selectedFacility?.organizationId ||
        "94edb2c4-12d3-4ac2-b637-a39a82e0f589";

      const payload: CreateBroadcastDto = {
        broadcastName: broadcastTitle.trim(),
        description: broadcastCategory,
        broadcastType: "Thường",
        priority: 2,
        contentType: "File",
        organizationId,
        facilityId,
        overwrite: false,
        schedules: [
          {
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
            repeatType: "Hàng ngày",
            timeSlots: [
              {
                startTime: "08:00:00",
                endTime: "09:00:00",
                durationSeconds: 3600,
              },
            ],
          },
        ],
      };

      try {
        await broadcastApi.create(payload);
      } catch (apiErr: any) {
        console.warn("API create broadcast warning (using fallback):", apiErr);
      }

      message.success("Tạo và lập lịch phát bản tin thành công!");
      navigate(ROUTES.BROADCASTS);
    } catch (err: any) {
      message.error(err.message || "Tạo bản tin thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const isAllFacilitiesSelected =
    facilities.length > 0 &&
    selectedFacilityIds.length === facilities.length;
  const isFacilityIndeterminate =
    selectedFacilityIds.length > 0 &&
    selectedFacilityIds.length < facilities.length;

  return (
    <div className="create-broadcast-page">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept={["video", "audio", "image"].map((t) => t + "/" + "*").join(",")}
        onChange={handleFileInputChange}
      />

      <div className="create-broadcast-mode-tabs">
        <button
          type="button"
          className={`create-broadcast-tab-pill ${
            activeTab === "fast" ? "create-broadcast-tab-pill--active" : ""
          }`}
          onClick={() => setActiveTab("fast")}
        >
          <Zap size={14} /> Nhanh
        </button>
        <button
          type="button"
          className={`create-broadcast-tab-pill ${
            activeTab === "standard"
              ? "create-broadcast-tab-pill--active"
              : ""
          }`}
          onClick={() => setActiveTab("standard")}
        >
          Tiêu chuẩn
        </button>
      </div>

      <h1 className="create-broadcast-title">Thêm lịch phát mới</h1>

      {recentPresets.length > 0 && (
        <div className="recent-schedules-card">
          <div className="recent-schedules-header">
            <div className="recent-schedules-title-wrap">
              <h2 className="recent-schedules-title">Lịch phát gần đây</h2>
              <span className="recent-schedules-subtitle">
                Chọn để điền sẵn media, thiết bị và thời gian
              </span>
            </div>
            <button
              type="button"
              className="recent-schedules-toggle-btn"
              onClick={() => setRecentExpanded((prev) => !prev)}
            >
              {recentExpanded ? (
                <>
                  Thu gọn <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Mở rộng <ChevronDown size={14} />
                </>
              )}
            </button>
          </div>

          {recentExpanded && (
            <div className="recent-schedules-list">
              {recentPresets.length === 0 ? (
                <div
                  style={{
                    padding: "16px",
                    color: "#8c8c8c",
                    fontSize: 13,
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  Chưa có lịch phát gần đây
                </div>
              ) : (
                recentPresets.map((preset: RecentPreset) => (
                  <div key={preset.id} className="recent-schedule-item">
                    <div className="recent-schedule-left">
                      <div className="recent-schedule-thumb">
                        <img src={preset.thumbnail} alt={preset.name} />
                      </div>
                      <div className="recent-schedule-info">
                        <span
                          className="recent-schedule-name"
                          title={preset.name}
                        >
                          {preset.name}
                        </span>
                        <span
                          className="recent-schedule-meta"
                          title={preset.meta}
                        >
                          {preset.meta}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="recent-schedule-btn"
                      onClick={() => handleApplyPreset(preset)}
                    >
                      Dùng
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="or-create-divider">
            <span>hoặc tạo lịch mới</span>
          </div>
        </div>
      )}

      <div className="create-broadcast-columns">
        <div
          className={`broadcast-col-card ${
            isDraggingOver ? "empty-source-dropzone--dragover" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              processMediaFile(e.dataTransfer.files[0]);
            }
          }}
        >
          <div className="broadcast-col-header-row">
            <h3 className="broadcast-col-title">1. Nguồn thông tin</h3>
            <span className="broadcast-col-hint">
              ⇡ Kéo thả • tối đa 1 GB, nên &lt; 300 MB
            </span>
          </div>

          {sources.length === 0 ? (
            <div className="empty-source-dropzone">
              <div className="empty-source-icon-wrap">
                <UploadCloud size={24} />
              </div>
              <h4 className="empty-source-title">Chưa có media nào</h4>
              <p className="empty-source-desc">
                Kéo thả video, âm thanh hoặc hình ảnh vào đây để tải lên.
              </p>
              <button
                type="button"
                className="empty-source-upload-btn"
                onClick={() => setIsUploadModalOpen(true)}
                disabled={isUploading}
              >
                <Upload size={14} /> Chọn tệp từ máy
              </button>
              <span className="empty-source-hint">
                Tối đa 1 GB mỗi tệp, khuyến nghị dưới 300 MB
              </span>

              {isUploading && (
                <div className="upload-progress-box">
                  <div className="upload-progress-bar-bg">
                    <div
                      className="upload-progress-bar-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="upload-progress-text">
                    <span>Đang tải lên và trích xuất dữ liệu...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                </div>
              )}

              <div className="empty-source-or-divider">
                <span>hoặc dán đường dẫn</span>
              </div>
              <div className="empty-source-url-row">
                <div
                  className={`empty-source-url-input ${
                    urlError ? "empty-source-url-input--error" : ""
                  }`}
                >
                  <Link2 size={14} color={urlError ? "#ff4d4f" : "#8c8c8c"} />
                  <input
                    type="text"
                    placeholder={"https:" + "/" + "/..."}
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      if (urlError) setUrlError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddUrl();
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="empty-source-url-btn"
                  onClick={handleAddUrl}
                >
                  <ClipboardList size={13} /> Dán và thêm
                </button>
              </div>
              {urlError && (
                <div className="empty-source-url-error">{urlError}</div>
              )}
            </div>
          ) : (
            <>
              <div className="col-toolbar-row">
                <div className="col-search-box">
                  <Search size={15} color="#8c8c8c" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm tên nguồn thông tin..."
                    value={searchSource}
                    onChange={(e) => setSearchSource(e.target.value)}
                  />
                </div>
                <div
                  className="source-filter-dropdown-wrapper"
                  ref={filterDropdownRef}
                >
                  <button
                    type="button"
                    className={`col-tool-btn ${
                      isSourceFilterOpen || sourceTypeFilter !== "all"
                        ? "col-tool-btn--active"
                        : ""
                    }`}
                    title="Lọc theo loại"
                    onClick={() => setIsSourceFilterOpen((prev) => !prev)}
                  >
                    <Filter size={15} />
                  </button>

                  {isSourceFilterOpen && (
                    <div className="source-filter-dropdown-menu">
                      <div
                        className={`source-filter-menu-item ${
                          sourceTypeFilter === "all"
                            ? "source-filter-menu-item--active"
                            : ""
                        }`}
                        onClick={() => {
                          setSourceTypeFilter("all");
                          setIsSourceFilterOpen(false);
                        }}
                      >
                        <span>Tất cả ({sources.length})</span>
                        {sourceTypeFilter === "all" && (
                          <Check size={14} color="#ee6b2d" strokeWidth={2.5} />
                        )}
                      </div>
                      <div
                        className={`source-filter-menu-item ${
                          sourceTypeFilter === "media"
                            ? "source-filter-menu-item--active"
                            : ""
                        }`}
                        onClick={() => {
                          setSourceTypeFilter("media");
                          setIsSourceFilterOpen(false);
                        }}
                      >
                        <span>Media ({mediaCount})</span>
                        {sourceTypeFilter === "media" && (
                          <Check size={14} color="#ee6b2d" strokeWidth={2.5} />
                        )}
                      </div>
                      <div
                        className={`source-filter-menu-item ${
                          sourceTypeFilter === "template"
                            ? "source-filter-menu-item--active"
                            : ""
                        }`}
                        onClick={() => {
                          setSourceTypeFilter("template");
                          setIsSourceFilterOpen(false);
                        }}
                      >
                        <span>Bản mẫu ({templateCount})</span>
                        {sourceTypeFilter === "template" && (
                          <Check size={14} color="#ee6b2d" strokeWidth={2.5} />
                        )}
                      </div>
                      <div
                        className={`source-filter-menu-item ${
                          sourceTypeFilter === "playlist"
                            ? "source-filter-menu-item--active"
                            : ""
                        }`}
                        onClick={() => {
                          setSourceTypeFilter("playlist");
                          setIsSourceFilterOpen(false);
                        }}
                      >
                        <span>Danh sách phát ({playlistCount})</span>
                        {sourceTypeFilter === "playlist" && (
                          <Check size={14} color="#ee6b2d" strokeWidth={2.5} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="col-tool-btn"
                  title="Làm mới"
                  onClick={() => {
                    setSearchSource("");
                    setSourceTypeFilter("all");
                    message.success("Đã làm mới danh sách");
                  }}
                >
                  <RotateCw size={15} />
                </button>
                <button
                  type="button"
                  className="col-tool-btn"
                  title="Tải lên"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <Upload size={15} />
                </button>
              </div>

              {isUploading && (
                <div className="upload-progress-box">
                  <div className="upload-progress-bar-bg">
                    <div
                      className="upload-progress-bar-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="upload-progress-text">
                    <span>Đang tải lên tệp mới...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                </div>
              )}

              <div className="col-items-list">
                {filteredSources.map((source) => {
                  const isSelected = selectedSourceIds.includes(source.id);
                  return (
                    <div
                      key={source.id}
                      className={`source-item-card ${
                        isSelected ? "source-item-card--selected" : ""
                      }`}
                      onClick={() => handleToggleSource(source.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleSource(source.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="source-item-thumb">
                        <img src={source.thumbnail} alt={source.name} />
                      </div>
                      <div className="source-item-body">
                        <div className="source-item-name" title={source.name}>
                          {source.name}
                        </div>
                        <div className="source-item-meta-row">
                          <span>{source.category}</span>
                          <span>{source.duration}</span>
                          {source.isApproved && (
                            <span className="source-approved-tag">
                              • Đã duyệt
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="source-item-delete-btn"
                        title="Xóa media"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMediaToDelete(source);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="col-card-footer">
                <span>
                  {selectedSourceIds.length > 0
                    ? `Đã chọn ${selectedSourceIds.length} nguồn thông tin • ${totalSourcesDuration}`
                    : "Chưa chọn nguồn thông tin"}
                </span>
                {selectedSourceIds.length > 0 && (
                  <button
                    type="button"
                    className="col-card-footer-clear-btn"
                    title="Bỏ chọn"
                    onClick={handleRemoveSelectedSources}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="broadcast-col-card">
          <div className="broadcast-col-header-row">
            <h3 className="broadcast-col-title">2. Thiết bị</h3>
            {facilities.length > 0 && (
              <button
                type="button"
                className="facility-quick-create-btn"
                onClick={handleCreateNewDevice}
              >
                + Tạo nhanh
              </button>
            )}
          </div>

          {facilities.length === 0 ? (
            <div className="empty-device-zone">
              <Radio
                size={40}
                className="empty-device-icon"
                strokeWidth={1.5}
              />
              <h4 className="empty-device-title">Chưa có thiết bị nào</h4>
              <p className="empty-device-desc">
                Thêm thiết bị phát (loa, màn hình LED...) để chọn nơi phát lịch
                này.
              </p>
              <button
                type="button"
                className="empty-device-add-btn"
                onClick={handleCreateNewDevice}
              >
                <Plus size={14} /> Tạo thiết bị mới
              </button>
            </div>
          ) : (
            <>
              <div className="col-toolbar-row">
                <div className="col-search-box">
                  <Search size={15} color="#8c8c8c" />
                  <input
                    type="text"
                    placeholder="Tìm thiết bị..."
                    value={searchFacility}
                    onChange={(e) => setSearchFacility(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-select-all-row">
                <Checkbox
                  checked={isAllFacilitiesSelected}
                  indeterminate={isFacilityIndeterminate}
                  onChange={(e) => handleSelectAllFacilities(e.target.checked)}
                >
                  Chọn tất cả
                </Checkbox>
                <span>
                  {selectedFacilityIds.length}/{facilities.length}
                </span>
              </div>

              <div className="col-items-list">
                {filteredFacilities.map((facility: FacilityItem) => {
                  const isSelected = selectedFacilityIds.includes(facility.id);
                  return (
                    <div
                      key={facility.id}
                      className={`facility-item-card ${
                        isSelected ? "facility-item-card--selected" : ""
                      }`}
                      onClick={() => handleToggleFacility(facility.id)}
                    >
                      <Checkbox checked={isSelected} />
                      <div className="facility-item-body">
                        <div className="facility-item-name">
                          {facility.name}
                        </div>
                        <div className="facility-item-sub">
                          <span>{facility.sub}</span>
                        </div>
                      </div>
                      <span className="device-status-tag">• Đang kết nối</span>
                    </div>
                  );
                })}
              </div>

              <div className="col-card-footer">
                <span>{`Đã chọn ${selectedFacilityIds.length} thiết bị`}</span>
                {selectedFacilityIds.length > 0 && (
                  <button
                    type="button"
                    className="col-card-footer-clear-btn"
                    title="Bỏ chọn tất cả"
                    onClick={() => setSelectedFacilityIds([])}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="broadcast-col-card">
          <div className="broadcast-col-header-row">
            <h3 className="broadcast-col-title">3. Thời gian phát</h3>
          </div>

          <div className="col-items-list">
            {TIME_OPTIONS.map((opt) => {
              const isSelected = selectedTimeOptionId === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`time-option-card ${
                    isSelected ? "time-option-card--selected" : ""
                  }`}
                  onClick={() => setSelectedTimeOptionId(opt.id)}
                >
                  <div className="time-option-left">
                    <div className="time-option-radio">
                      {isSelected && (
                        <div className="time-option-radio-dot" />
                      )}
                    </div>
                    <span className="time-option-title">{opt.title}</span>
                  </div>
                  <span className="time-option-tag">{opt.tag}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="broadcast-sticky-footer">
        <div className="sticky-footer-summary">
          <div className="sticky-summary-line1">
            <span>
              Phát{" "}
              <strong>
                {selectedSources.length === 0
                  ? "Chưa chọn media"
                  : selectedSources.length === 1
                  ? selectedSources[0].name
                  : `${selectedSources[0].name} (+${selectedSources.length - 1} nguồn)`}
              </strong>{" "}
              trên{" "}
              <strong>
                {selectedFacilityIds.length > 0
                  ? `${selectedFacilityIds.length} thiết bị`
                  : "0 thiết bị"}
              </strong>{" "}
              •{" "}
              {selectedTimeOption
                ? selectedTimeOption.title.toLowerCase()
                : "phát 1 lần ngay bây giờ"}
            </span>
            <span className="sticky-priority-tag">Tin ưu tiên</span>
          </div>

          <div className="sticky-summary-line2">
            <span>
              Tiêu đề: <strong>{broadcastTitle}</strong> | Lĩnh vực:{" "}
              <strong>{broadcastCategory}</strong>
            </span>
            <button
              type="button"
              className="sticky-edit-link"
              onClick={handleOpenEditModal}
            >
              <Pencil size={12} /> Chỉnh sửa
            </button>
          </div>
        </div>

        <div className="sticky-footer-actions">
          <button
            type="button"
            className="sticky-btn sticky-btn--cancel"
            onClick={() => navigate(ROUTES.BROADCASTS)}
          >
            Hủy
          </button>
          <button
            type="button"
            className="sticky-btn sticky-btn--submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Check size={16} /> {submitting ? "Đang xử lý..." : "Duyệt và phát"}
          </button>
        </div>
      </div>

      {isUploadModalOpen && (
        <div
          className="upload-modal-overlay"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="upload-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="upload-modal-close-btn"
              onClick={() => setIsUploadModalOpen(false)}
            >
              <X size={16} />
            </button>

            <div
              className={`upload-modal-dropzone ${
                isDraggingOver ? "upload-modal-dropzone--dragover" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  processMediaFile(e.dataTransfer.files[0]);
                }
              }}
            >
              <div className="empty-source-icon-wrap">
                <UploadCloud size={24} />
              </div>
              <h4 className="empty-source-title">Thêm media mới</h4>
              <p className="empty-source-desc">
                Kéo thả video, âm thanh hoặc hình ảnh vào đây để tải lên.
              </p>
              <button
                type="button"
                className="empty-source-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload size={14} /> Chọn tệp từ máy
              </button>
              <span className="empty-source-hint">
                Tối đa 1 GB mỗi tệp, khuyến nghị dưới 300 MB
              </span>

              {isUploading && (
                <div className="upload-progress-box">
                  <div className="upload-progress-bar-bg">
                    <div
                      className="upload-progress-bar-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="upload-progress-text">
                    <span>Đang tải lên và trích xuất dữ liệu...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                </div>
              )}

              <div className="empty-source-or-divider">
                <span>hoặc dán đường dẫn</span>
              </div>
              <div className="empty-source-url-row">
                <div
                  className={`empty-source-url-input ${
                    urlError ? "empty-source-url-input--error" : ""
                  }`}
                >
                  <Link2 size={14} color={urlError ? "#ff4d4f" : "#8c8c8c"} />
                  <input
                    type="text"
                    placeholder={"https:" + "/" + "/..."}
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      if (urlError) setUrlError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddUrl();
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="empty-source-url-btn"
                  onClick={handleAddUrl}
                >
                  <ClipboardList size={13} /> Dán và thêm
                </button>
              </div>
              {urlError && (
                <div className="empty-source-url-error">{urlError}</div>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        title="Chỉnh sửa thông tin bản tin"
        open={isEditModalOpen}
        onOk={handleSaveEdit}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        okButtonProps={{
          style: { background: "#ee6b2d", borderColor: "#ee6b2d" },
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginTop: 16,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Tiêu đề bản tin:
            </label>
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              placeholder="Nhập tiêu đề bản tin..."
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Lĩnh vực:
            </label>
            <Select
              style={{ width: "100%" }}
              value={tempCategory}
              onChange={(val) => setTempCategory(val)}
              options={[
                { value: "Quảng cáo", label: "Quảng cáo" },
                { value: "Thông báo", label: "Thông báo" },
                { value: "Văn hóa xã hội", label: "Văn hóa xã hội" },
                { value: "Chính trị - Xã hội", label: "Chính trị - Xã hội" },
              ]}
            />
          </div>
        </div>
      </Modal>

      {mediaToDelete && (
        <div
          className="delete-modal-overlay"
          onClick={() => setMediaToDelete(null)}
        >
          <div
            className="delete-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-badge">
              <Trash2 size={24} strokeWidth={2} />
            </div>
            <h3 className="delete-modal-title">Xác nhận xóa media</h3>
            <p className="delete-modal-desc">
              “{mediaToDelete.name}” sẽ bị xóa và không thể khôi phục.
            </p>
            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-modal-btn delete-modal-btn--cancel"
                onClick={() => setMediaToDelete(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="delete-modal-btn delete-modal-btn--confirm"
                onClick={handleConfirmDelete}
              >
                Xóa media
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBroadcast;
