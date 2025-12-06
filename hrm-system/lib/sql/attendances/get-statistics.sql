SELECT 
  AVG(a.worked_hours) as average_per_day,
	SUM(a.worked_hours) as sum_of_month
FROM attendances a
WHERE EXTRACT(YEAR FROM a.date) = $2
  AND EXTRACT(MONTH FROM a.date) = $3
	AND a.employee_id = $1;