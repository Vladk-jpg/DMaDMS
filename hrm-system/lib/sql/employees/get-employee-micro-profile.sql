SELECT 
  e.id,
  ep.first_name || ' ' || ep.second_name AS fullName,
  ep.picture,
  p.name as position
FROM employees e
JOIN employee_profiles ep ON ep.employee_id = e.id
JOIN positions p ON e.position_id = p.id
WHERE e.id = $1;