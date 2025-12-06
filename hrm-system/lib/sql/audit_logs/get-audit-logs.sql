SELECT 
  ep.first_name || ' ' || ep.second_name AS fullname,
  al.employee_id,
  at.name AS action,
  al.entity_name,
  al.entity_id,
  al.created_at,
  al.details
FROM audit_logs al
LEFT JOIN employee_profiles ep ON ep.employee_id = al.employee_id
JOIN action_types at ON al.action_type_id = at.id
ORDER BY al.created_at DESC
LIMIT $1
OFFSET $2