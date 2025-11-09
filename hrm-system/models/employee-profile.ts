export interface EmployeeProfile {
  passport_number: string;
  employee_id: string;
  first_name: string;
  second_name: string;
  middle_name?: string | null;
  hire_date: Date;
  birth_date: Date;
  address?: string | null;
  iban?: string | null;
}

