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
