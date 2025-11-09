export interface AuditLog {
  id: string;
  employee_id: string;
  action_type_id: string;
  entity_name: string;
  entity_id: string;
  created_at: Date;
  details?: Record<string, unknown> | null;
}
