import { EmployeeStatus } from "@/models";

export interface EmployeeWithProfile {
  id: string;
  fullname: string;
  first_name: string;
  second_name: string;
  middle_name: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  passportnumber: string;
  hiredate: Date;
  birthdate: Date;
  address: string;
  iban: string;
  department: string;
  department_id: string;
  position: string;
  position_id: string;
  role: string;
  user_role_id: string;
  picture: string;
}
