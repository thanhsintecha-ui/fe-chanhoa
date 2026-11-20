import type { ApiResponse } from "./api.types";
import type {
  ApprovalStatus,
  BroadcastItem,
  BroadcastStatus,
  BroadcastType,
  RepeatType,
} from "../pages/broadcasts/data/broadcasts.mock";

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface BroadcastListResponseDto {
  id: string;
  broadcastCode: string;
  broadcastName: string;
  description: string | null;
  broadcastType: string;
  priority: number;
  status: string;
  contentType: string;
  organizationId: string;
  facilityId: string;
  facilityName: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
  totalSchedules: number;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canReject: boolean;
  canCancel: boolean;
  canPause: boolean;
  canResume: boolean;
  isFromParent: boolean;
  isPriority: boolean;
}

export interface BroadcastTimeSlotDto {
  id?: string;
  broadcastScheduleId?: string;
  startTime: string;
  endTime: string;
  durationSeconds?: number;
}

export interface BroadcastDeviceDto {
  id?: string;
  broadcastScheduleId?: string;
  deviceId: string;
  deviceName?: string | null;
  deviceCode?: string | null;
  deviceStatus?: string;
  isPreempted?: boolean;
  preemptedByBroadcastId?: string | null;
}

export interface BroadcastScheduleDto {
  id: string;
  broadcastId: string;
  startDate: string;
  endDate: string;
  repeatType: string;
  repeatDays?: string | null;
  isLocked?: boolean;
  timeSlots: BroadcastTimeSlotDto[];
  devices: BroadcastDeviceDto[];
}

export interface BroadcastDetailResponseDto {
  id: string;
  broadcastCode: string;
  broadcastName: string;
  description: string | null;
  broadcastType: string;
  priority: number;
  status: string;
  rejectionReason: string | null;
  contentType: string;
  mediaId: string | null;
  mediaName: string | null;
  playlistId: string | null;
  playlistName: string | null;
  organizationId: string;
  facilityId: string;
  facilityName: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canReject: boolean;
  canCancel: boolean;
  canPause: boolean;
  canResume: boolean;
  isFromParent: boolean;
  isPriority: boolean;
  schedules: BroadcastScheduleDto[];
}

export interface CreateBroadcastTimeSlotDto {
  startTime: string;
  endTime: string;
  durationSeconds?: number;
}

export interface CreateBroadcastScheduleDto {
  startDate: string;
  endDate: string;
  repeatType: string;
  repeatDays?: string;
  timeSlots: CreateBroadcastTimeSlotDto[];
  deviceIds?: string[];
}

export interface CreateBroadcastDto {
  broadcastCode?: string;
  broadcastName: string;
  description?: string;
  broadcastType?: string;
  priority?: number;
  contentType: string;
  mediaId?: string | null;
  playlistId?: string | null;
  organizationId: string;
  facilityId: string;
  overwrite?: boolean;
  schedules?: CreateBroadcastScheduleDto[];
}

export interface UpdateBroadcastDto {
  broadcastName: string;
  description?: string;
  broadcastType?: string;
  priority?: number;
  contentType: string;
  mediaId?: string | null;
  playlistId?: string | null;
}

export interface ApproveBroadcastDto {
  approvedBy?: string;
  overwrite?: boolean;
}

export interface RejectBroadcastDto {
  rejectionReason: string;
  rejectedBy?: string;
}

export interface CancelBroadcastDto {
  reason?: string;
}

export interface PauseBroadcastDto {
  reason?: string;
}

export interface CheckConflictRequestDto {
  organizationId: string;
  facilityId: string;
  deviceIds?: string[];
  startDate: string;
  endDate: string;
  timeSlots: CreateBroadcastTimeSlotDto[];
  excludeBroadcastId?: string;
}

export interface ConflictingBroadcastItemDto {
  broadcastId: string;
  broadcastCode: string;
  broadcastName: string;
  broadcastType: string;
  priority: number;
  deviceId: string;
  deviceName?: string;
  deviceCode?: string;
  facilityName?: string;
  startTime: string;
  endTime: string;
  conflictStartDate: string;
  conflictEndDate: string;
  conflictDurationMinutes: number;
}

export interface ConflictCheckResultDto {
  hasConflict: boolean;
  broadcastMode: string;
  facilityName?: string;
  summaryMessage: string;
  totalConflictingBroadcasts: number;
  conflictingBroadcasts: ConflictingBroadcastItemDto[];
}

export interface GetBroadcastListParams {
  facilityId?: string;
  organizationId?: string;
  status?: string;
  search?: string;
  pageIndex?: number;
  pageSize?: number;
  requestingFacilityId?: string;
}

export type BroadcastListApiResponse = ApiResponse<PagedResult<BroadcastListResponseDto>>;
export type BroadcastDetailApiResponse = ApiResponse<BroadcastDetailResponseDto>;
export type ConflictCheckApiResponse = ApiResponse<ConflictCheckResultDto>;

// Helper functions for mapping between Backend DTOs and Frontend models
export function mapStatusToUi(backendStatus?: string | null): {
  approvalStatus: ApprovalStatus;
  broadcastStatus: BroadcastStatus;
} {
  switch (backendStatus) {
    case "Chờ duyệt":
      return { approvalStatus: "pending", broadcastStatus: "waiting" };
    case "Từ chối duyệt":
      return { approvalStatus: "rejected", broadcastStatus: "not-playing" };
    case "Chưa phát":
      return { approvalStatus: "approved", broadcastStatus: "not-playing" };
    case "Sắp tới lịch":
      return { approvalStatus: "approved", broadcastStatus: "scheduled" };
    case "Đang phát":
      return { approvalStatus: "approved", broadcastStatus: "playing" };
    case "Chờ phát":
      return { approvalStatus: "approved", broadcastStatus: "waiting" };
    case "Tạm ngưng":
      return { approvalStatus: "approved", broadcastStatus: "paused" };
    case "Đã kết thúc":
      return { approvalStatus: "approved", broadcastStatus: "finished" };
    case "Đã hủy":
      return { approvalStatus: "rejected", broadcastStatus: "cancelled" };
    default:
      return { approvalStatus: "pending", broadcastStatus: "waiting" };
  }
}

export function mapBroadcastTypeToUi(type?: string | null, priority?: number | null): BroadcastType {
  if (type === "Khẩn cấp" || priority === 1) return "priority";
  return "normal";
}

export function mapRepeatTypeToUi(repeat?: string | null): RepeatType {
  switch (repeat) {
    case "Hàng ngày":
      return "daily";
    case "Hàng tuần":
      return "weekly";
    case "Hàng tháng":
      return "monthly";
    case "Không lặp":
    default:
      return "none";
  }
}

export function mapDtoToBroadcastItem(dto: BroadcastListResponseDto): BroadcastItem {
  const { approvalStatus, broadcastStatus } = mapStatusToUi(dto.status);
  return {
    id: dto.id,
    code: dto.broadcastCode || "",
    title: dto.broadcastName || "",
    type: mapBroadcastTypeToUi(dto.broadcastType, dto.priority),
    approvalStatus,
    broadcastStatus,
    repeatType: "none",
    startDate: dto.createdAt ? dto.createdAt.slice(0, 10) : "",
    endDate: "",
    startTime: "",
    endTime: "",
    facility: dto.facilityName || "",
    creator: dto.approvedBy || "Người tạo",
    isChildFacility: dto.isFromParent,
    sourceType: dto.contentType,
    canEdit: dto.canEdit,
    canDelete: dto.canDelete,
    canApprove: dto.canApprove,
    canReject: dto.canReject,
    canCancel: dto.canCancel,
    canPause: dto.canPause,
    canResume: dto.canResume,
  };
}

export function mapDetailDtoToBroadcastItem(dto: BroadcastDetailResponseDto): BroadcastItem {
  const { approvalStatus, broadcastStatus } = mapStatusToUi(dto.status);
  const firstSchedule = dto.schedules?.[0];
  const firstSlot = firstSchedule?.timeSlots?.[0];

  return {
    id: dto.id,
    code: dto.broadcastCode || "",
    title: dto.broadcastName || "",
    type: mapBroadcastTypeToUi(dto.broadcastType, dto.priority),
    approvalStatus,
    broadcastStatus,
    repeatType: firstSchedule ? mapRepeatTypeToUi(firstSchedule.repeatType) : "none",
    startDate: firstSchedule?.startDate ? firstSchedule.startDate.slice(0, 10) : (dto.createdAt ? dto.createdAt.slice(0, 10) : ""),
    endDate: firstSchedule?.endDate ? firstSchedule.endDate.slice(0, 10) : "",
    startTime: firstSlot?.startTime ? firstSlot.startTime.slice(0, 5) : "",
    endTime: firstSlot?.endTime ? firstSlot.endTime.slice(0, 5) : "",
    facility: dto.facilityName || "",
    creator: dto.approvedBy || "Người tạo",
    isChildFacility: dto.isFromParent,
    sourceType: dto.contentType,
    sourceName: dto.mediaName || dto.playlistName || undefined,
    rejectReason: dto.rejectionReason || undefined,
    devices: firstSchedule?.devices?.map((d) => ({
      id: d.deviceId,
      name: d.deviceName || d.deviceCode || "Thiết bị",
      facility: dto.facilityName || "",
      address: d.deviceStatus || "",
    })) || [],
    timeSlots: firstSchedule?.timeSlots?.map((t) => ({
      startTime: t.startTime ? t.startTime.slice(0, 5) : "",
      endTime: t.endTime ? t.endTime.slice(0, 5) : "",
      times: 1,
    })) || [],
    canEdit: dto.canEdit,
    canDelete: dto.canDelete,
    canApprove: dto.canApprove,
    canReject: dto.canReject,
    canCancel: dto.canCancel,
    canPause: dto.canPause,
    canResume: dto.canResume,
  };
}

