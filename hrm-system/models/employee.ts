import { EmployeeStatus } from "./enums";

export interface Employee {
  id: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  password_hash: string;
  department_id: string;
  user_role_id: string;
  position_id: string;
  created_at: Date;
  updated_at: Date;
}
