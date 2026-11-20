export type BroadcastType = "priority" | "normal";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type BroadcastStatus =
  | "playing"
  | "paused"
  | "waiting"
  | "finished"
  | "not-playing"
  | "scheduled"
  | "cancelled";

export type RepeatType = "none" | "daily" | "weekly" | "monthly";

export interface BroadcastSource {
  id: string;
  name: string;
  description?: string;
  qualities: Array<"4K" | "2K" | "FHD" | "HD">;
  duration: string;
}

export interface BroadcastFacility {
  id: string;
  name: string;
  active: boolean;
}

export interface BroadcastDevice {
  id: string;
  name: string;
  facility: string;
  address: string;
}

export interface BroadcastTimeSlot {
  startTime: string;
  endTime: string;
  times: number;
}

export interface BroadcastHistoryItem {
  id: string;
  deviceCode: string;
  deviceName: string;
  startTime: string;
  endTime: string;
  facility: string;
}

export interface BroadcastItem {
  id: string;
  code: string;
  title: string;
  type: BroadcastType;
  approvalStatus: ApprovalStatus;
  broadcastStatus: BroadcastStatus;
  repeatType: RepeatType;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  facility: string;
  creator: string;
  isChildFacility: boolean;
  category?: string;
  sourceType?: string;
  sourceName?: string;
  rejectReason?: string;

  facilityDisplay?: "tags" | "devices";
  facilities?: BroadcastFacility[];
  devices?: BroadcastDevice[];

  sources?: BroadcastSource[];

  broadcastMode?: string;
  timeSlots?: BroadcastTimeSlot[];
  repeatDays?: string[];

  history?: BroadcastHistoryItem[];

  canEdit?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
  canReject?: boolean;
  canCancel?: boolean;
  canPause?: boolean;
  canResume?: boolean;
}

export const typeLabels: Record<BroadcastType, string> = {
  priority: "Tin ưu tiên",
  normal: "Tin thường",
};

export const approvalLabels: Record<ApprovalStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối duyệt",
};

export const broadcastLabels: Record<BroadcastStatus, string> = {
  playing: "Đang phát",
  paused: "Tạm ngưng",
  waiting: "Chờ phát",
  finished: "Đã kết thúc",
  "not-playing": "Chưa phát",
  scheduled: "Sắp tới lịch",
  cancelled: "Đã hủy",
};

export const repeatLabels: Record<RepeatType, string> = {
  none: "Không lặp",
  daily: "Hằng ngày",
  weekly: "Ngày trong tuần",
  monthly: "Ngày trong tháng",
};

// Dữ liệu mẫu rỗng (mock data đã được loại bỏ hoàn toàn sau khi tích hợp API)
export const broadcastsMock: BroadcastItem[] = [];
export const broadcastHistoryMock: BroadcastHistoryItem[] = [];
