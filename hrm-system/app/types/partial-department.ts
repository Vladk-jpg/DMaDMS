export interface PartialDepartment {
  id: string;
  name: string;
  description?: string | null;
  head_id?: string | null;
  head_name?: string | null;
}