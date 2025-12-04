SELECT
  d.id,
  d.name,
  d.description,
  d.head_id,
  ep.first_name || ' ' || ep.second_name AS head_name
FROM departments d
LEFT JOIN employee_profiles ep ON ep.employee_id = d.head_id
ORDER BY d.name ASC
LIMIT $1
OFFSET $2;