import { LeaveType, LeaveStatus } from "./enums";

export interface Leave {
  id: string;
  employee_id: string;
  leave_type: LeaveType;
  start_date: Date;
  end_date: Date;
  status: LeaveStatus;
}

