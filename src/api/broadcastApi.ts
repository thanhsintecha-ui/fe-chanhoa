import axiosInstance from "./axiosInstance";
import type { ApiResponse } from "../types/api.types";
import type {
  ApproveBroadcastDto,
  BroadcastDetailApiResponse,
  BroadcastDetailResponseDto,
  BroadcastListApiResponse,
  BroadcastListResponseDto,
  BroadcastScheduleDto,
  CancelBroadcastDto,
  CheckConflictRequestDto,
  ConflictCheckApiResponse,
  ConflictCheckResultDto,
  CreateBroadcastDto,
  CreateBroadcastScheduleDto,
  GetBroadcastListParams,
  PagedResult,
  PauseBroadcastDto,
  RejectBroadcastDto,
  UpdateBroadcastDto,
} from "../types/broadcast.types";

const checkResult = <T>(result: ApiResponse<T>): T => {
  if (!result.success) {
    throw new Error(result.message || "Thao tác trên Bản tin thất bại");
  }
  return result.data;
};

export const broadcastApi = {
  // USR-BRD-01: Lấy danh sách bản tin (lọc, tìm kiếm, phân trang)
  getList: async (
    params?: GetBroadcastListParams,
  ): Promise<PagedResult<BroadcastListResponseDto>> => {
    const response = await axiosInstance.get<BroadcastListApiResponse>(
      "/Broadcasts",
      { params },
    );
    return checkResult(response.data);
  },

  // USR-BRD-03: Xem thông tin bản tin chi tiết
  getById: async (
    id: string,
    requestingFacilityId?: string,
  ): Promise<BroadcastDetailResponseDto> => {
    const response = await axiosInstance.get<BroadcastDetailApiResponse>(
      `/Broadcasts/${encodeURIComponent(id)}`,
      { params: requestingFacilityId ? { requestingFacilityId } : undefined },
    );
    return checkResult(response.data);
  },

  // USR-BRD-Content: Lấy cấu hình / nội dung đa phương tiện bản tin
  getContent: async (
    id: string,
    requestingFacilityId?: string,
  ): Promise<BroadcastDetailResponseDto> => {
    const response = await axiosInstance.get<BroadcastDetailApiResponse>(
      `/Broadcasts/${encodeURIComponent(id)}/content`,
      { params: requestingFacilityId ? { requestingFacilityId } : undefined },
    );
    return checkResult(response.data);
  },

  // USR-BRD-11: Lấy danh sách bản tin cơ sở con
  getSubFacilityBroadcasts: async (
    parentFacilityId: string,
    params?: { search?: string; pageIndex?: number; pageSize?: number },
  ): Promise<PagedResult<BroadcastListResponseDto>> => {
    const response = await axiosInstance.get<BroadcastListApiResponse>(
      `/Broadcasts/sub-facilities/${encodeURIComponent(parentFacilityId)}`,
      { params },
    );
    return checkResult(response.data);
  },

  // USR-BRD-02: Thêm mới bản tin
  create: async (
    data: CreateBroadcastDto,
  ): Promise<BroadcastDetailResponseDto> => {
    const response = await axiosInstance.post<BroadcastDetailApiResponse>(
      "/Broadcasts",
      data,
    );
    return checkResult(response.data);
  },

  // Conflict Detection Engine: Kiểm tra trước trùng lịch phát sóng
  checkConflict: async (
    data: CheckConflictRequestDto,
  ): Promise<ConflictCheckResultDto> => {
    const response = await axiosInstance.post<ConflictCheckApiResponse>(
      "/Broadcasts/check-conflict",
      data,
    );
    return checkResult(response.data);
  },

  // USR-BRD-04: Cập nhật thông tin bản tin
  update: async (
    id: string,
    data: UpdateBroadcastDto,
    requestingFacilityId?: string,
  ): Promise<BroadcastDetailResponseDto> => {
    const response = await axiosInstance.put<BroadcastDetailApiResponse>(
      `/Broadcasts/${encodeURIComponent(id)}`,
      data,
      { params: requestingFacilityId ? { requestingFacilityId } : undefined },
    );
    return checkResult(response.data);
  },

  // USR-BRD-05: Xóa bản tin
  delete: async (
    id: string,
    requestingFacilityId?: string,
  ): Promise<boolean> => {
    const response = await axiosInstance.delete<ApiResponse<boolean>>(
      `/Broadcasts/${encodeURIComponent(id)}`,
      { params: requestingFacilityId ? { requestingFacilityId } : undefined },
    );
    return checkResult(response.data);
  },

  // USR-BRD-06: Phê duyệt bản tin
  approve: async (
    id: string,
    data: ApproveBroadcastDto,
  ): Promise<BroadcastDetailResponseDto> => {
    const response = await axiosInstance.post<BroadcastDetailApiResponse>(
      `/Broadcasts/${encodeURIComponent(id)}/approve`,
      data,
    );
    return checkResult(response.data);
  },

  // USR-BRD-07: Từ chối duyệt bản tin
  reject: async (
    id: string,
    data: RejectBroadcastDto,
  ): Promise<BroadcastDetailResponseDto> => {
    const response = await axiosInstance.post<BroadcastDetailApiResponse>(
      `/Broadcasts/${encodeURIComponent(id)}/reject`,
      data,
    );
    return checkResult(response.data);
  },

  // USR-BRD-08: Hủy phát bản tin
  cancel: async (
    id: string,
    data: CancelBroadcastDto,
    requestingFacilityId?: string,
  ): Promise<boolean> => {
    const response = await axiosInstance.post<ApiResponse<boolean>>(
      `/Broadcasts/${encodeURIComponent(id)}/cancel`,
      data,
      { params: requestingFacilityId ? { requestingFacilityId } : undefined },
    );
    return checkResult(response.data);
  },

  // USR-BRD-09: Tạm ngưng phát sóng
  pause: async (
    id: string,
    data: PauseBroadcastDto,
  ): Promise<BroadcastDetailResponseDto> => {
    const response = await axiosInstance.post<BroadcastDetailApiResponse>(
      `/Broadcasts/${encodeURIComponent(id)}/pause`,
      data,
    );
    return checkResult(response.data);
  },

  // USR-BRD-10: Tiếp tục phát sóng
  resume: async (id: string): Promise<BroadcastDetailResponseDto> => {
    const response = await axiosInstance.post<BroadcastDetailApiResponse>(
      `/Broadcasts/${encodeURIComponent(id)}/resume`,
      {},
    );
    return checkResult(response.data);
  },

  // Quản lý lịch phát
  getSchedules: async (broadcastId: string): Promise<BroadcastScheduleDto[]> => {
    const response = await axiosInstance.get<
      ApiResponse<BroadcastScheduleDto[]>
    >(`/Broadcasts/${encodeURIComponent(broadcastId)}/schedules`);
    return checkResult(response.data);
  },

  addSchedule: async (
    broadcastId: string,
    data: CreateBroadcastScheduleDto,
  ): Promise<BroadcastScheduleDto> => {
    const response = await axiosInstance.post<
      ApiResponse<BroadcastScheduleDto>
    >(`/Broadcasts/${encodeURIComponent(broadcastId)}/schedules`, data);
    return checkResult(response.data);
  },

  deleteSchedule: async (scheduleId: string): Promise<boolean> => {
    const response = await axiosInstance.delete<ApiResponse<boolean>>(
      `/Broadcasts/schedules/${encodeURIComponent(scheduleId)}`,
    );
    return checkResult(response.data);
  },
};

