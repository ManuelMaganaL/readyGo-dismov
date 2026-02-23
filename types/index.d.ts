export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface Checkbox { 
  id: string;
  activity_id: number;
  description: string;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  checkboxes: Checkbox[];
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

// Activities and Index layout components
export interface ActivityBlockProps {
  id: number;
  title: string;
  time_start: string;
  time_end: string;
  checkboxes: Checkbox[];
  position: number;
  isDetailed: boolean;
  setIsDetailed: Dispatch<SetStateAction<boolean[]>>;
  onDelete?: (id: number) => void = () => {};
  setIdToDelete?: Dispatch<SetStateAction<number | null>> = () => {};
  setIsDeleteModalVisible?: Dispatch<SetStateAction<boolean>> = () => {};
  setIdToModify?: Dispatch<SetStateAction<number | null>> = () => {};
  setIsModifyModalVisible?: Dispatch<SetStateAction<boolean>> = () => {};
  isSwipeable?: boolean = true; 
}

// Modal components
export interface AddActivityModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  setActivities: Dispatch<SetStateAction<Activity[]>>;
}

export interface DeleteActivityModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  activityId: string;
  message: string;
  onAccept: (id: string) => void;
}

export interface ModifyActivityModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  id: number;
  activities: Activity[];
  setActivities: Dispatch<SetStateAction<Activity[]>>;
}

export interface CloseSessionModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
}

// Settings layaout components
export interface SettingItemProps {
  icon: any;
  label: string;
  type?: 'link' | 'switch' | 'button';
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (val: boolean) => void;
  isDanger?: boolean;
}

// UI components
export interface ButtonProps {
  text: string;
  style: "main" | "secondary" | "danger";
  onPress: () => void;
}

// Layaout general components
export interface UserHeaderProps {
  user: User;
  isSettings?: boolean;
}