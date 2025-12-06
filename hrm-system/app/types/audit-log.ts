export interface AuditLog {
  fullname: string;
  employee_id: string;
  action: string;
  entity_name: string;
  entity_id: string;
  created_at: Date | string;
  details: string | null;
}
