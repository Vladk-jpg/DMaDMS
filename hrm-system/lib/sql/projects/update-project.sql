UPDATE projects SET
  name = COALESCE($2, name),
  description = COALESCE($3, description),
  start_date = COALESCE($4, start_date),
  end_date = COALESCE($5, end_date)
WHERE id = $1;
