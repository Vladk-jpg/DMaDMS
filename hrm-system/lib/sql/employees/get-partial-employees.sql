SELECT
  e.id,
  ep.first_name || ' ' || ep.second_name AS name,
  e.email,
  r.name AS role,
  ep.picture
FROM
  employees e
  JOIN employee_profiles ep ON ep.employee_id = e.id
  JOIN roles r ON e.user_role_id = r.id
WHERE r.name <> 'Admin'
  AND ($3::text IS NULL OR
       ep.first_name ILIKE '%' || $3 || '%' OR
       ep.second_name ILIKE '%' || $3 || '%' OR
       e.email ILIKE '%' || $3 || '%')
ORDER BY
  r.name ASC, ep.first_name ASC
LIMIT $1
OFFSET $2