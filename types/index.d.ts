// Activities and Index layout components
export interface Checkbox { 
  id: number;
  activityId: number;
  description: string;
  complete: boolean;
}

export interface Activity {
  id: number,
  title: string;
  time_start: string;
  time_end: string;
  checkboxes: Checkbox[];
}

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
  id: number;
  setActivities: Dispatch<SetStateAction<Activity[]>>;
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
  isSettings?: boolean;
}