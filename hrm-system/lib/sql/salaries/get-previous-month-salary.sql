SELECT
  s.id,
  s.base_salary,
  s.bonus,
  s.salary_date,
  c.code AS currency,
  c.id AS currency_id
FROM salaries s
JOIN currencies c ON s.currency_id = c.id
WHERE s.employee_id = $1
  AND EXTRACT(YEAR FROM s.salary_date) = EXTRACT(YEAR FROM DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')
  AND EXTRACT(MONTH FROM s.salary_date) = EXTRACT(MONTH FROM DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')
ORDER BY s.salary_date DESC
LIMIT 1;
