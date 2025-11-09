export interface Department {
  id: string;
  name: string;
  description?: string | null;
  head_id?: string | null;
  created_at: Date;
}

