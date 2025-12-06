SELECT
  e.id,
  ep_profile.first_name || ' ' || ep_profile.second_name AS name,
  e.email,
  r.name AS role,
  ep_profile.picture,
  ep.assigned_date
FROM employee_projects ep
JOIN employees e ON ep.employee_id = e.id
JOIN employee_profiles ep_profile ON e.id = ep_profile.employee_id
JOIN project_roles r ON ep.role_id = r.id
WHERE ep.project_id = $1
ORDER BY ep.assigned_date DESC
