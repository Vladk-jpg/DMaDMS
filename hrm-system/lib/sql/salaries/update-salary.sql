UPDATE salaries SET
  base_salary = COALESCE($2, base_salary),
  bonus = COALESCE($3, bonus),
  currency_id = COALESCE($4, currency_id)
WHERE id = $1;
