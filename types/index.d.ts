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
  onDelete: (id: number) => void;
  setIdToDelete: Dispatch<SetStateAction<number | null>>;
  setIsDeleteModalVisible: Dispatch<SetStateAction<boolean>>;
  setIdToModify: Dispatch<SetStateAction<number | null>>;
  setIsModifyModalVisible: Dispatch<SetStateAction<boolean>>;
}

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