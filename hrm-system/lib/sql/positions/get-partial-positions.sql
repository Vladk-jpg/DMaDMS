SELECT
  id,
  grade || ' ' || name AS name
FROM positions
WHERE ($3::text IS NULL OR name ILIKE '%' || $3 || '%')
ORDER BY name
LIMIT $1
OFFSET $2;
