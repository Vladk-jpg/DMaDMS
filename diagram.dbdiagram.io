@startuml hrm system

Enum EmployeeStatus {
  working
  fired
  probation
  vacation
}

Enum Grade {
  junior
  middle
  senior
  team_lead
  tech_lead
  solution_architect
}

Enum Currency {
  BYN
  USD
}

Enum ProjectRole {
  developer
  PM
  BA
  QA
  devops
  SCRUM_master
}

Enum LeaveType {
  vacation
  sick_day
  unpaid
}

Enum LeaveStatus {
  pending
  approved
  rejected
}

Enum UserRole {
  admin
  hr
  manager
  employee
}

Enum ActionType {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
}

Table employees {
  id uuid [pk]
  first_name varchar [not null]
  second_name varchar [not null]
  middle_name varchar
  birth_date date [not null]
  email varchar [unique, not null]
  phone varchar [unique, not null]
  status EmployeeStatus [not null, default: "working"]
  department_id uuid
  position_id uuid 
  created_at timestamp
  updated_at timestamp
}

Table employee_profiles {
  id uuid [pk]
  employee_id uuid [unique]
  hire_date date [not null]
  passport_number varchar [not null, unique]
  address varchar
  IBAN varchar
  created_at timestamp
  updated_at timestamp
}

Table departments {
  id uuid [pk]
  name varchar [unique, not null]
  description text
  head_id uuid [not null]
  created_at timestamp
}

Table positions {
  id uuid [pk]
  name varchar [unique, not null]
  grade Grade [not null]
  description text
  created_at timestamp
}

Table salaries {
  id uuid [pk]
  employee_id uuid [not null]
  base_salary integer [not null]
  bonus integer [not null]
  currency Currency [not null, default: "BYN"]
  effective_from timestamp [not null]
}

Table projects {
  id uuid [pk]
  name varchar [not null]
  description text
  start_date timestamp [not null]
  end_date timestamp
}

Table employee_project {
  employee_id uuid [not null]
  project_id uuid [not null]
  role ProjectRole
}

Table attendances {
  id uuid [pk]
  employee_id uuid [not null]
  date date [not null]
  worked_hours integer [not null]
}

Table leaves {
  id uuid [pk]
  employee_id uuid [not null]
  leave_type LeaveType [not null, default: "unpaid"]
  start_date date [not null]
  end_date date [not null]
  status LeaveStatus [not null, default: "pending"]
}

Table perfomance_reviews {
  id uuid [pk]
  employee_id uuid [not null]
  review_date date [not null]
  score integer [not null]
  comments text
  reviewer_id uuid
}

Table user_accounts {
  id uuid [pk]
  employee_id uuid [not null]
  username varchar [not null, unique]
  password_hash varchar [not null]
  role UserRole [not null]
  created_at timestamp
}

Table audit_logs {
  id uuid [pk]
  user_id uuid [not null]
  action_type ActionType [not null]
  entity_name varchar [not null]
  entity_id uuid [not null]
  created_at timestamp
  details JSON
}

Ref: employees.department_id > departments.id
Ref: employees.position_id > positions.id
Ref: departments.head_id - employees.id
Ref: salaries.employee_id - employees.id
Ref: employee_project.employee_id > employees.id
Ref: employee_project.project_id > projects.id
Ref: attendances.employee_id > employees.id
Ref: leaves.employee_id > employees.id
Ref: perfomance_reviews.employee_id > employees.id
Ref: perfomance_reviews.reviewer_id > employees.id
Ref: user_accounts.employee_id - employees.id
Ref: audit_logs.user_id > user_accounts.id
Ref: employee_profiles.employee_id - employees.id
