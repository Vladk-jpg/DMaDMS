export interface Leave {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: Date | string;
  end_date: Date | string;
  status: string;
}