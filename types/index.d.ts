export interface Activity {
  id: number,
  title: string;
  time_start: string;
  end_time: string;
  complete: boolean;
}

export interface ActivityBlockProps {
  title: string;
  time_start: string;
  end_time: string;
  complete: boolean;
}
