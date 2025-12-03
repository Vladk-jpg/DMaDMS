SELECT
  e.id,
  ep.first_name || ' ' || ep.second_name AS name,
  e.email,
  r.name AS role
FROM
  employees e
  JOIN employee_profile ep ON ep.employee_id = e.id
  JOIN roles r ON e.user_role_id = r.id
ORDER BY
  ep.first_name ASC
LIMIT $1 
OFFSET $2