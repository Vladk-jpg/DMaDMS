INSERT INTO employee_projects 
  (employee_id, project_id, role_id, assigned_date)
VALUES 
  ($1, $2, $3, CURRENT_DATE)
ON CONFLICT (employee_id, project_id) DO NOTHING
