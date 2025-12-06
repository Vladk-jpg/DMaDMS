INSERT INTO attendances (employee_id, date, worked_hours)
VALUES ($1, $2, $3)
RETURNING id, employee_id, date, worked_hours;
