SELECT
  e.id,
  ep.first_name || ' ' || ep.second_name AS name,
  e.email,
  pr.name AS role,
  eproj.assigned_date
FROM
  employees e
  JOIN employee_profiles ep ON ep.employee_id = e.id
  JOIN employee_projects eproj ON e.id = eproj.employee_id
  JOIN project_roles pr ON eproj.role_id = pr.id
WHERE eproj.project_id = $1 AND e.status::text <> 'fired'
ORDER BY
  ep.first_name ASC
LIMIT $2 
OFFSET $3