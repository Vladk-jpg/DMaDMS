export interface Project {
  id: string;
  name: string;
  description?: string | null;
  start_date: Date;
  end_date?: Date | null;
}

