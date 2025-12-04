SELECT COUNT(*) as total
FROM projects
WHERE ($1::text IS NULL OR name ILIKE '%' || $1 || '%');
