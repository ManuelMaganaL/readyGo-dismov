import { Dispatch, SetStateAction } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;
  created_at: string;
}

export interface Checkbox { 
  id: string;
  activity_id: number;
  description: string;
  created_at: string;
  complete?: boolean;
}

export interface Activity {
  id: string | number;
  user_id: string;
  name: string;
  title?: string;
  time_start?: string;
  time_end?: string;
  created_at: string;
  checkboxes: Checkbox[];
  activity_id?: string;
  checklist_state?: boolean[];
  order_index?: number;
}

export interface DayActivity {
  id: number;
  user_id: string;
  day_id: string;
  name: string;
  time_start: string;
  time_end: string;
  checkboxes: Checkbox[];
  created_at: string;
}

export interface ActivityBlockProps {
  id: string | number;
  title: string;
  time_start: string;
  time_end: string;
  checkboxes: Checkbox[];
  isDetailed: boolean;
  onToggleDetail: () => void;
  onDelete?: (id: string | number) => void;
  setIdToDelete?: Dispatch<SetStateAction<string | null>>;
  setIsDeleteModalVisible?: Dispatch<SetStateAction<boolean>>;
  setIdToModify?: Dispatch<SetStateAction<string | null>>;
  setIsModifyModalVisible?: Dispatch<SetStateAction<boolean>>;
  isSwipeable?: boolean;
  initialChecklistState?: boolean[];
  initialCompleted?: boolean;
  onCompletionChange?: (id: string | number, completed: boolean, checklistState: boolean[]) => void;
}

export interface AddActivityModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  setActivities: Dispatch<SetStateAction<Activity[]>>;
}

export interface AddToDayModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  setActivities: Dispatch<SetStateAction<Activity[]>>;
  availableActivities: Activity[];
  currentUserId: string | null;
  selectedDate: Date;
}

export interface DeleteActivityModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  activityId: string;
  message: string;
  onAccept: (id: string) => void;
}

export interface RenameActivityModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  activity: Activity;
  setActivities: Dispatch<SetStateAction<Activity[]>>;
}

export interface ModifyActivityModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  id: string | number;
  activities: Activity[];
  setActivities: Dispatch<SetStateAction<Activity[]>>;
  selectedDate: Date;
}

export interface CloseSessionModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
}

export interface SettingItemProps {
  icon: any;
  label: string;
  type?: 'link' | 'switch' | 'button';
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (val: boolean) => void;
  isDanger?: boolean;
}

export interface ButtonProps {
  text: string;
  style: "main" | "secondary" | "danger" | "outline";
  onPress: () => void;
  disabled?: boolean;
}

export interface UserHeaderProps {
  user: User;
  isSettings?: boolean;
}