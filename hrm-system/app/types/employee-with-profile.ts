import { EmployeeStatus } from "@/models";

export interface EmployeeWithProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  passportNumber: string;
  hireDate: Date;
  birthDate: Date;
  address: string;
  iban: string;
}
