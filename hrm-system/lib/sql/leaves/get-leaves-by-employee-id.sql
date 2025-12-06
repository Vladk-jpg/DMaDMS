SELECT leave_type, start_date, end_date, status
FROM leaves
WHERE employee_id = $1 AND ($2::text IS NULL OR status::text = $2)
ORDER BY end_date DESC;