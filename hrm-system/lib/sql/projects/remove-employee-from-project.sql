DELETE FROM employee_projects
WHERE employee_id = $1 AND project_id = $2
