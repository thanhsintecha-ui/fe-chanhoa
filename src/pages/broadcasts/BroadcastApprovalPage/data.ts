import type { BroadcastApprovalData } from "./types";
import mediaSample from "../../../assets/images/media.png";

export const MOCK_BROADCAST_APPROVAL: BroadcastApprovalData = {
  id: "1",
  code: "KPHANVN",
  title: "Khám phá Hội An - Hành trình qua di sản, văn hóa và ẩm thực Việt Nam",
  category: "Du lịch",
  isPriority: true,
  priorityLabel: "Tin ưu tiên",
  videoPreviewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",

  playlist: {
    name: "Những giai điệu bình yên dành cho ngày dài và những khoảnh khắc thư giãn cuối tuần",
    duration: "00:00:15",
    playMode: "Phát theo thứ tự",
    category: "Du lịch",
    items: [
      {
        id: "item-1",
        index: 1,
        type: "video",
        title: "Chậm lại một chút để lắng nghe nhịp sống quanh ta",
        originalDuration: "00:00:15",
        duration: "00:00:15",
        thumbnailUrl: mediaSample,
      },
      {
        id: "item-2",
        index: 2,
        type: "image",
        title: "Đi tìm cảm hứng trong những chuyến đi cuối tuần",
        originalDuration: "00:00:15",
        duration: "00:00:15",
        thumbnailUrl: mediaSample,
      },
      {
        id: "item-3",
        index: 3,
        type: "template",
        title: "Một buổi sáng dịu dàng giữa những con phố quen",
        originalDuration: "00:00:15",
        duration: "00:00:15",
        thumbnailUrl: mediaSample,
      },
      {
        id: "item-4",
        index: 4,
        type: "audio",
        title: "Những điều nhỏ bé làm nên một ngày đáng nhớ",
        originalDuration: "00:00:15",
        duration: "00:00:15",
        thumbnailUrl: mediaSample,
        isUnapproved: true,
      },
    ],
  },

  facilities: ["Quận 1", "Quận 7", "Thủ Đức", "Hà Nội", "Đà Nẵng"],

  schedule: {
    dateRange: "08/10/2026 - 31/12/2026",
    timeRange: "08:00 - 09:00",
    repeatType: "Lặp theo tuần",
    repeatDays: "Thứ 2, Thứ 3",
  },

  summary: {
    broadcastName: "Khám phá Hội An-Việt Nam - KPHANVN",
    category: "Du lịch",
    content: "Banner khuyến mãi tháng 10 - Theo thứ tự",
    typeLabel: "Tin ưu tiên (phát sau khi duyệt)",
    duration: "00:00:15",
    deviceCount: 4,
    playDate: "08/10/2026 - 31/12/2026",
    playTime: "08:00 lặp 2 lần",
    repeatLabel: "Hằng ngày",
    creator: "Nguyễn Văn A",
  },

  hasUnapprovedMedia: true,
};

