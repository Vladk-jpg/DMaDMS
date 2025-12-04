UPDATE departments SET
  name = COALESCE($2, name),
  description = COALESCE($3, description),
  head_id = COALESCE($4, head_id)
WHERE id = $1;