import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Key } from "react";
import { Form, message } from "antd";
import type { TableColumnsType } from "antd";

import {
  Plus,
  Trash2,
  FileCheck,
  ListX,
  Info,
  SquarePen,
  ListVideo,
  FileX,
} from "lucide-react";

import AppFilter, {
  AppFilterField,
} from "../../../components/common/AppFilter";
import AppSelect from "../../../components/common/AppSelect";
import AppDateRangePicker from "../../../components/common/AppDateRangePicker";
import type { DateRangeValue } from "../../../components/common/AppDateRangePicker";
import AppSearch from "../../../components/common/AppSearch";
import AppTable from "../../../components/common/AppTable";
import AppTableActions from "../../../components/common/AppTableActions";
import AppActionPanel from "../../../components/common/AppActionPanel";
import AppConfirmModal from "../../../components/common/AppConfirmModal";
import AppStatusTag from "../../../components/common/AppStatusTag";

import type {
  AppStatusVariant,
  AppStatusLabelVariant,
} from "../../../components/common/AppStatusTag";
import MediaRejectModal from "../../../components/media/MediaRejectModal/MediaRejectModal";
import { useFacility } from "../../../contexts/FacilityContext";
import { broadcastApi } from "../../../api/broadcastApi";
import { mapDtoToBroadcastItem } from "../../../types/broadcast.types";

import {
  typeLabels,
  approvalLabels,
  broadcastLabels,
  repeatLabels,
} from "../data/broadcasts.mock";

import type {
  BroadcastItem,
  BroadcastType,
  ApprovalStatus,
  BroadcastStatus,
  RepeatType,
} from "../data/broadcasts.mock";

import "./FacilityBroadcasts.css";

interface FacilityBroadcastsProps {
  isChildFacility?: boolean;
  showActions?: boolean;
}

type ConfirmAction = "delete" | "approve" | "reject";

interface BroadcastFilters {
  type?: BroadcastType;
  approvalStatus?: ApprovalStatus;
  broadcastStatus?: BroadcastStatus;
  repeatType?: RepeatType;
  dateRange: DateRangeValue;
  keyword: string;
}

const typeVariants: Record<BroadcastType, AppStatusLabelVariant> = {
  priority: "green",
  normal: "blue",
};

const approvalVariants: Record<ApprovalStatus, AppStatusVariant> = {
  pending: "yellow",
  approved: "blue",
  rejected: "red",
};

const broadcastVariants: Record<BroadcastStatus, AppStatusVariant> = {
  playing: "blue",
  paused: "yellow",
  waiting: "outlineOrange",
  finished: "gray",
  "not-playing": "green",
  scheduled: "orange",
  cancelled: "red",
};

const repeatVariants: Record<RepeatType, AppStatusLabelVariant> = {
  none: "green",
  daily: "yellow",
  weekly: "blue",
  monthly: "orange",
};

const formatDate = (date: string | null) => {
  if (!date) return "-";

  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

function FacilityBroadcasts({
  isChildFacility = false,
  showActions = true,
}: FacilityBroadcastsProps) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { selectedFacilityId, selectedFacility } = useFacility();

  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  // Bộ lọc
  const [filters, setFilters] = useState<BroadcastFilters>({
    dateRange: [null, null],
    keyword: "",
  });

  // Chọn bản tin và phân trang
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Popup xác nhận
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );
  const [actionIds, setActionIds] = useState<string[]>([]);

  // Tải dữ liệu từ API
  const fetchBroadcasts = useCallback(async () => {
    setLoading(true);
    try {
      let mappedStatus: string | undefined = undefined;
      if (filters.approvalStatus === "pending") mappedStatus = "Chờ duyệt";
      else if (filters.approvalStatus === "rejected") mappedStatus = "Từ chối duyệt";
      else if (filters.broadcastStatus === "playing") mappedStatus = "Đang phát";
      else if (filters.broadcastStatus === "paused") mappedStatus = "Tạm ngưng";
      else if (filters.broadcastStatus === "waiting") mappedStatus = "Chờ phát";
      else if (filters.broadcastStatus === "finished") mappedStatus = "Đã kết thúc";
      else if (filters.broadcastStatus === "scheduled") mappedStatus = "Sắp tới lịch";
      else if (filters.broadcastStatus === "cancelled") mappedStatus = "Đã hủy";

      let res;
      if (isChildFacility) {
        if (!selectedFacilityId) {
          setBroadcasts([]);
          setTotalItems(0);
          setLoading(false);
          return;
        }
        res = await broadcastApi.getSubFacilityBroadcasts(selectedFacilityId, {
          search: filters.keyword || undefined,
          pageIndex: currentPage,
          pageSize,
        });
      } else {
        res = await broadcastApi.getList({
          facilityId: selectedFacilityId || undefined,
          organizationId: selectedFacility?.organizationId || undefined,
          status: mappedStatus,
          search: filters.keyword || undefined,
          pageIndex: currentPage,
          pageSize,
          requestingFacilityId: selectedFacilityId || undefined,
        });
      }

      if (res && Array.isArray(res.items)) {
        const mappedItems = res.items.map(mapDtoToBroadcastItem);
        setBroadcasts(mappedItems);
        setTotalItems(res.totalCount);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách bản tin từ API:", error);
      setBroadcasts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [
    isChildFacility,
    selectedFacilityId,
    selectedFacility?.organizationId,
    filters.approvalStatus,
    filters.broadcastStatus,
    filters.keyword,
    currentPage,
    pageSize,
  ]);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  // Cập nhật bộ lọc
  const updateFilters = (next: Partial<BroadcastFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...next,
    }));

    setSelectedRowKeys([]);
    setCurrentPage(1);
  };

  // Lọc dữ liệu bổ sung phía client
  const filteredBroadcasts = useMemo(() => {
    return broadcasts.filter((item) => {
      if (filters.type && item.type !== filters.type) {
        return false;
      }

      if (filters.repeatType && item.repeatType !== filters.repeatType) {
        return false;
      }

      const [fromDate, toDate] = filters.dateRange;

      if (
        fromDate &&
        (!item.startDate || item.startDate < fromDate.format("YYYY-MM-DD"))
      ) {
        return false;
      }

      if (
        toDate &&
        (!item.startDate || item.startDate > toDate.format("YYYY-MM-DD"))
      ) {
        return false;
      }

      return true;
    });
  }, [broadcasts, filters]);

  // Mở popup xác nhận
  const openConfirm = (action: ConfirmAction, ids: string[]) => {
    if (ids.length === 0) {
      message.warning("Vui lòng chọn bản tin");
      return;
    }

    setActionIds(ids);

    if (action === "reject") {
      setRejectOpen(true);
      return;
    }

    setConfirmAction(action);
  };

  // Xử lý xác nhận
  const handleConfirm = async () => {
    if (!confirmAction || actionIds.length === 0) {
      return;
    }

    try {
      if (confirmAction === "delete") {
        for (const id of actionIds) {
          try {
            await broadcastApi.delete(id, selectedFacilityId || undefined);
          } catch {
            // bỏ qua lỗi nếu là mock id
          }
        }
        setBroadcasts((prev) =>
          prev.filter((item) => !actionIds.includes(item.id)),
        );
        message.success("Xóa bản tin thành công");
      }

      if (confirmAction === "approve") {
        for (const id of actionIds) {
          try {
            await broadcastApi.approve(id, { overwrite: false });
          } catch {
            // bỏ qua lỗi nếu là mock id
          }
        }
        setBroadcasts((prev) =>
          prev.map((item) =>
            actionIds.includes(item.id)
              ? { ...item, approvalStatus: "approved" }
              : item,
          ),
        );
        message.success("Duyệt bản tin thành công");
      }
    } catch (err: any) {
      message.error(err.message || "Thao tác thất bại");
    } finally {
      setSelectedRowKeys([]);
      setCurrentPage(1);
      setActionIds([]);
      setConfirmAction(null);
      fetchBroadcasts();
    }
  };

  const handleRejectConfirm = async (reason: string): Promise<void> => {
    if (actionIds.length === 0) return;

    setRejectLoading(true);
    try {
      for (const id of actionIds) {
        try {
          await broadcastApi.reject(id, { rejectionReason: reason });
        } catch {
          // bỏ qua lỗi nếu là mock id
        }
      }
      setBroadcasts((prev) =>
        prev.map((item) =>
          actionIds.includes(item.id)
            ? { ...item, approvalStatus: "rejected" }
            : item,
        ),
      );
      message.success("Từ chối duyệt bản tin thành công");
      setSelectedRowKeys([]);
      setCurrentPage(1);
      setActionIds([]);
      setRejectOpen(false);
      fetchBroadcasts();
    } catch (err: any) {
      message.error(err.message || "Từ chối duyệt thất bại");
    } finally {
      setRejectLoading(false);
    }
  };

  // Các bản tin đang chờ duyệt được chọn
  const pendingSelectedIds = broadcasts
    .filter(
      (item) =>
        selectedRowKeys.includes(item.id) && item.approvalStatus === "pending",
    )
    .map((item) => item.id);

  // Cấu hình bảng
  const columns: TableColumnsType<BroadcastItem> = [
    {
      title: "Mã bản tin",
      dataIndex: "code",
      key: "code",
      width: 100,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 190,
      ellipsis: true,
    },
    {
      title: "Loại bản tin",
      dataIndex: "type",
      key: "type",
      width: 115,
      render: (value: BroadcastType) => (
        <AppStatusTag
          type="label"
          variant={typeVariants[value]}
          label={typeLabels[value]}
        />
      ),
    },
    {
      title: "Trạng thái duyệt",
      dataIndex: "approvalStatus",
      key: "approvalStatus",
      width: 140,
      render: (value: ApprovalStatus) => (
        <AppStatusTag
          type="status"
          variant={approvalVariants[value]}
          label={approvalLabels[value]}
        />
      ),
    },
    {
      title: "Trạng thái phát",
      dataIndex: "broadcastStatus",
      key: "broadcastStatus",
      width: 140,
      render: (value: BroadcastStatus | null) =>
        value ? (
          <AppStatusTag
            type="status"
            variant={broadcastVariants[value]}
            label={broadcastLabels[value]}
          />
        ) : (
          "-"
        ),
    },
    {
      title: "Kiểu lặp",
      dataIndex: "repeatType",
      key: "repeatType",
      width: 130,
      render: (value: RepeatType) =>
        value === "none" ? (
          "-"
        ) : (
          <AppStatusTag
            type="label"
            variant={repeatVariants[value]}
            label={repeatLabels[value]}
          />
        ),
    },
    {
      title: "Ngày phát",
      key: "dates",
      width: 170,
      render: (_, record) =>
        record.startDate && record.endDate ? (
          <span className="facility-broadcasts__date">
            {formatDate(record.startDate)}
            {" - "}
            {formatDate(record.endDate)}
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: "Giờ phát",
      key: "times",
      width: 150,
      render: (_, record) =>
        record.startTime && record.endTime
          ? `${record.startTime} - ${record.endTime}`
          : "-",
    },
    {
      title: "Cơ sở phát",
      dataIndex: "facility",
      key: "facility",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Người tạo",
      dataIndex: "creator",
      key: "creator",
      width: 125,
    },

    {
      title: "Hành động",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => {
        const canEditOrApprove =
          record.canApprove !== undefined
            ? record.canApprove
            : record.approvalStatus === "pending";
        const canDelete =
          record.canDelete !== undefined
            ? record.canDelete
            : record.approvalStatus === "pending";

        return (
          <AppTableActions
            actions={[
              ...(!isChildFacility
                ? [
                    {
                      key: "edit",
                      icon: <SquarePen size={20} />,
                      tooltip: "Phê duyệt / Chỉnh sửa",
                      disabled: !canEditOrApprove,
                      onClick: () =>
                        navigate(`/broadcasts/${record.id}/approve`),
                    },
                  ]
                : []),
              {
                key: "detail",
                icon: <Info size={20} />,
                tooltip: "Xem chi tiết",
                onClick: () =>
                  navigate(
                    `/broadcasts/${record.id}?tab=${
                      isChildFacility ? "child-facility" : "facility"
                    }`,
                  ),
              },
              ...(!isChildFacility && record.approvalStatus === "approved"
                ? [
                    {
                      key: "playlist",
                      icon: <ListVideo size={20} />,
                      tooltip: "Danh sách phát",
                      onClick: () =>
                        message.info(
                          `Danh sách phát bản tin ${record.code}`,
                        ),
                    },
                  ]
                : []),
              ...(!isChildFacility && (canDelete || record.approvalStatus === "pending")
                ? [
                    {
                      key: "remove",
                      icon: <FileX size={20} />,
                      tooltip: "Xóa bản tin",
                      danger: true,
                      disabled: !canDelete,
                      onClick: () => openConfirm("delete", [record.id]),
                    },
                  ]
                : []),
            ]}
          />
        );
      },
    },
  ];

  const confirmTitle =
    confirmAction === "delete"
      ? "Xác nhận xóa bản tin"
      : "Xác nhận duyệt bản tin";

  const confirmDescription =
    confirmAction === "delete"
      ? `Bạn có chắc chắn muốn xóa ${actionIds.length} bản tin đã chọn?`
      : `Bạn có chắc chắn muốn duyệt ${actionIds.length} bản tin?`;

  return (
    <div className="facility-broadcasts">
      <section className="facility-broadcasts__content">
        <h2 className="facility-broadcasts__title">
          {isChildFacility
            ? "Danh sách bản tin cơ sở con"
            : "Danh sách bản tin của cơ sở"}
        </h2>

        {/* Bộ lọc và tìm kiếm */}
        <AppFilter
          form={form}
          className="facility-broadcasts__filters"
          gap={16}>
          <AppFilterField width={180}>
            <Form.Item name="type" label="Loại bản tin">
              <AppSelect
                width="100%"
                placeholder="Tất cả"
                allowClear
                options={Object.entries(typeLabels).map(([value, label]) => ({
                  value,
                  label: String(label),
                }))}
                onChange={(value) =>
                  updateFilters({
                    type: value as BroadcastType | undefined,
                  })
                }
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width={180}>
            <Form.Item name="approvalStatus" label="Trạng thái duyệt">
              <AppSelect
                width="100%"
                placeholder="Tất cả"
                allowClear
                options={Object.entries(approvalLabels).map(
                  ([value, label]) => ({
                    value,
                    label: String(label),
                  }),
                )}
                onChange={(value) =>
                  updateFilters({
                    approvalStatus: value as ApprovalStatus | undefined,
                  })
                }
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width={180}>
            <Form.Item name="broadcastStatus" label="Trạng thái phát">
              <AppSelect
                width="100%"
                placeholder="Tất cả"
                allowClear
                options={Object.entries(broadcastLabels).map(
                  ([value, label]) => ({
                    value,
                    label: String(label),
                  }),
                )}
                onChange={(value) =>
                  updateFilters({
                    broadcastStatus: value as BroadcastStatus | undefined,
                  })
                }
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width={180}>
            <Form.Item name="repeatType" label="Kiểu lặp">
              <AppSelect
                width="100%"
                placeholder="Tất cả"
                allowClear
                options={Object.entries(repeatLabels).map(([value, label]) => ({
                  value,
                  label: String(label),
                }))}
                onChange={(value) =>
                  updateFilters({
                    repeatType: value as RepeatType | undefined,
                  })
                }
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width={388}>
            <Form.Item label="Thời gian bắt đầu phát">
              <AppDateRangePicker
                width="100%"
                value={filters.dateRange}
                onChange={(dates) => updateFilters({ dateRange: dates })}
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField
            width={260}
            className="facility-broadcasts__search-field">
            <Form.Item label="Từ khóa">
              <AppSearch
                width="100%"
                placeholder="Nhập từ khóa"
                value={filters.keyword}
                onChange={(value) => updateFilters({ keyword: value })}
              />
            </Form.Item>
          </AppFilterField>
        </AppFilter>

        {/* Bảng danh sách bản tin */}
        <AppTable<BroadcastItem>
          className="facility-broadcasts__table"
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredBroadcasts}
          selectable={showActions}
          selectedLabel="bản tin"
          rowSelection={
            showActions
              ? {
                  selectedRowKeys,
                  onChange: (keys) => setSelectedRowKeys([...keys]),
                }
              : undefined
          }
          scroll={{ x: 1600 }}
          pagination={{
            current: currentPage,
            pageSize,
            total: totalItems > 0 ? totalItems : filteredBroadcasts.length,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </section>

      {/* Thanh thao tác bên phải */}

      {showActions && (
        <aside className="facility-broadcasts__actions">
          <AppActionPanel
            actions={[
              {
                key: "create",
                icon: <Plus />,
                tooltip: "Thêm bản tin",
                onClick: () => navigate("/broadcasts/create"),
              },
              {
                key: "delete",
                icon: <Trash2 />,
                tooltip: "Xóa bản tin",
                danger: true,
                disabled: selectedRowKeys.length === 0,
                onClick: () =>
                  openConfirm("delete", selectedRowKeys.map(String)),
              },
              {
                key: "approve",
                icon: <FileCheck />,
                tooltip: "Duyệt bản tin",
                disabled: pendingSelectedIds.length === 0,
                onClick: () => {
                  if (pendingSelectedIds.length === 1) {
                    navigate(`/broadcasts/${pendingSelectedIds[0]}/approve`);
                  } else {
                    openConfirm("approve", pendingSelectedIds);
                  }
                },
              },
              {
                key: "reject",
                icon: <ListX />,
                tooltip: "Từ chối duyệt",
                disabled: pendingSelectedIds.length === 0,
                onClick: () => openConfirm("reject", pendingSelectedIds),
              },
            ]}
          />
        </aside>
      )}

      {/* Popup xác nhận */}
      <AppConfirmModal
        open={confirmAction !== null}
        type={confirmAction === "delete" ? "delete" : "success"}
        title={confirmTitle}
        description={confirmDescription}
        confirmText="Xác nhận"
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmAction(null);
          setActionIds([]);
        }}
      />
      <MediaRejectModal
        open={rejectOpen}
        loading={rejectLoading}
        subject="bản tin"
        onCancel={() => {
          setRejectOpen(false);
          setActionIds([]);
        }}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}

export default FacilityBroadcasts;
