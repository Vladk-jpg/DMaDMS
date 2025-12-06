SELECT id, employee_id, date, worked_hours
FROM attendances
WHERE employee_id = $1
  AND date >= $2
  AND date <= $3
ORDER BY date DESC;
