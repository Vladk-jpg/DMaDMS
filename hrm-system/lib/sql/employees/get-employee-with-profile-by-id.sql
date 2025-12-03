SELECT
  e.id,
  e.email,
  e.phone,
  e.status,
  ep.first_name || ' ' || ep.second_name || ' ' || ep.middle_name AS fullName,
  ep.passport_number AS passportNumber,
  ep.hire_date AS hireDate,
  ep.birth_date AS birthDate,
  ep.address,
  ep.iban,
  d.name as department,
  p.name as position,
  r.name as role
FROM
  employees e
  JOIN employee_profiles ep ON ep.employee_id = e.id
  JOIN roles r ON e.user_role_id = r.id
  JOIN departments d ON e.department_id = d.id
  JOIN positions p ON e.position_id = p.id
WHERE e.id = $1;