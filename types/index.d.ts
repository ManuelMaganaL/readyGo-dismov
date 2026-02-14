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
  end_time: string;
  checkboxes: Checkbox[];
  complete: boolean;
}

export interface ActivityBlockProps {
  title: string;
  time_start: string;
  end_time: string;
  complete: boolean;
  checkboxes: Checkbox[];
  position: number;
  isDetailed: boolean;
  setIsDetailed: Dispatch<SetStateAction<boolean[]>>;
}
