INSERT INTO attendances (employee_id, date, worked_hours)
VALUES ($1, $2, $3)
ON CONFLICT (employee_id, date)
DO UPDATE SET worked_hours = EXCLUDED.worked_hours
RETURNING id, employee_id, date, worked_hours;
