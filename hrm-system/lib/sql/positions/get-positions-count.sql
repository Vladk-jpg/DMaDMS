SELECT COUNT(*) AS total
FROM positions
WHERE ($1::text IS NULL OR name LIKE '%' || $1 || '%');
