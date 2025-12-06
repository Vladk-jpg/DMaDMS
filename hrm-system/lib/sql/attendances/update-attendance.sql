UPDATE attendances
SET 
  worked_hours = COALESCE($2, worked_hours),
  date = COALESCE($3, date)
WHERE id = $1
RETURNING id, employee_id, date, worked_hours;
