SELECT
  p.id,
  p.name,
  p.description,
  p.start_date,
  p.end_date,
  pr.name as role,
  ep.assigned_date
FROM employee_projects ep
JOIN projects p ON ep.project_id = p.id
JOIN project_roles pr ON pr.id = ep.role_id
WHERE ep.employee_id = $1
ORDER BY p.start_date DESC
