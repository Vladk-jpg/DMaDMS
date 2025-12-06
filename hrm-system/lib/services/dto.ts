export interface CreateEmployeeDto {
  email: string;
  phone: string;
  password: string;
  departmentId: string;
  userRoleId: string;
  positionId: string;
  passportNumber: string;
  firstName: string;
  secondName: string;
  middleName: string;
  birthDate: Date;
  hireDate: Date;
  address: string;
  iban: string;
}

export interface CreateDepartmentDto {
  name: string;
  description: string;
  head_id?: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  start_date: Date;
  end_date?: Date;
}

export interface CreateSalaryDto {
  employee_id: string;
  base_salary: number;
  bonus: number;
  salary_date: Date;
  currency_id: string;
}

export interface UpdateSalaryDto {
  base_salary?: number;
  bonus?: number;
  currency_id?: string;
}

export interface CreatePerformanceReviewDto {
  employee_id: string;
  reviewer_id: string;
  score: number;
  comments: string;
  review_date: Date;
}

export interface CreateAttendanceDto {
  employee_id: string;
  date: Date;
  worked_hours: number;
}

export interface UpdateAttendanceDto {
  worked_hours?: number;
  date?: Date;
}
