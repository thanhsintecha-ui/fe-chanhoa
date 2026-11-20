export type MediaType = "video" | "image" | "template" | "audio";

export interface PlaylistItemReview {
  id: string;
  index: number;
  type: MediaType;
  title: string;
  originalDuration: string;
  duration: string;
  thumbnailUrl?: string;
  isUnapproved?: boolean;
}

export interface SectionRevisionState {
  isNeedsEdit: boolean;
  selectedReasons: string[];
  description: string;
  subItemNotes?: Record<string, string>; // Góp ý cho từng item con nếu có
}

export interface BroadcastApprovalData {
  id: string;
  code: string;
  title: string;
  category: string;
  isPriority: boolean;
  priorityLabel: string;
  videoPreviewUrl: string;

  playlist: {
    name: string;
    duration: string;
    playMode: string;
    category: string;
    items: PlaylistItemReview[];
  };

  facilities: string[];

  schedule: {
    dateRange: string;
    timeRange: string;
    repeatType: string;
    repeatDays: string;
  };

  summary: {
    broadcastName: string;
    category: string;
    content: string;
    typeLabel: string;
    duration: string;
    deviceCount: number;
    playDate: string;
    playTime: string;
    repeatLabel: string;
    creator: string;
  };

  hasUnapprovedMedia: boolean;
}

