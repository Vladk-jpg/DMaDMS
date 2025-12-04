SELECT COUNT(*) as total
FROM employees e
JOIN employee_profiles ep ON ep.employee_id = e.id
JOIN roles r ON r.id = e.user_role_id
WHERE r.name <> 'Admin'
  AND ($1::text IS NULL OR
       ep.first_name ILIKE '%' || $1 || '%' OR
       ep.second_name ILIKE '%' || $1 || '%' OR
       e.email ILIKE '%' || $1 || '%');

