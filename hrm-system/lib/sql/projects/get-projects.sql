SELECT *
FROM projects
WHERE ($3::text IS NULL OR name LIKE '%' || $3 || '%')
ORDER BY start_date DESC
LIMIT $1
OFFSET $2;
