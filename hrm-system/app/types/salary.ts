export interface Salary {
  id: string;
  employee_id: string;
  base_salary: string;
  bonus: string;
  salary_date: Date;
  currency: string;
  currency_id?: string;
}
