SELECT
  e.id,
  ep.first_name || ' ' || ep.second_name AS name,
  e.email,
  r.name AS role
FROM
  employees e
  JOIN employee_profiles ep ON ep.employee_id = e.id
  JOIN roles r ON e.user_role_id = r.id
WHERE (r.name = 'Admin' OR r.name = 'HR') AND e.status::text <> 'fired'
ORDER BY
  r.name ASC, ep.first_name ASC
LIMIT $1 
OFFSET $2