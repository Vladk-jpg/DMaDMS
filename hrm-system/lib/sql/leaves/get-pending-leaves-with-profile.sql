SELECT
  l.id,
  l.employee_id,
  ep.first_name || ' ' || ep.second_name AS fullname,
  l.leave_type,
  l.start_date,
  l.end_date,
  l.status
FROM leaves l
JOIN employee_profiles ep ON ep.employee_id = l.employee_id
WHERE l.status::text = 'pending'
ORDER BY l.start_date DESC