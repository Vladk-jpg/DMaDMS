WITH current_user_projects AS (
  SELECT project_id
  FROM employee_projects
  WHERE employee_id = $1
),
teammates_with_projects AS (
  SELECT DISTINCT
    e.id,
    ep.first_name || ' ' || ep.second_name AS name,
    e.email,
    r.name AS role,
    ep.picture,
    (
      SELECT p.name
      FROM employee_projects ep1
      JOIN projects p ON ep1.project_id = p.id
      WHERE ep1.employee_id = e.id
        AND ep1.project_id IN (SELECT project_id FROM current_user_projects)
      ORDER BY ep1.assigned_date DESC
      LIMIT 1
    ) AS project_name
  FROM employees e
  JOIN employee_profiles ep ON ep.employee_id = e.id
  JOIN roles r ON e.user_role_id = r.id
  JOIN employee_projects emp ON emp.employee_id = e.id
  WHERE emp.project_id IN (SELECT project_id FROM current_user_projects)
    AND e.id != $1
)
SELECT *
FROM teammates_with_projects
WHERE project_name IS NOT NULL
ORDER BY name;
