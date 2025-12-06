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
ORDER BY s.salary_date DESC;