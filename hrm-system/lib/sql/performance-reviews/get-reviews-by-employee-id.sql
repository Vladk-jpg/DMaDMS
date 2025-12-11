SELECT
  pr.id,
  pr.score,
  pr.comments,
  pr.review_date,
  ep.first_name || ' ' || ep.second_name AS reviewer_name
FROM performance_reviews pr
LEFT JOIN employees e ON e.id = pr.reviewer_id
LEFT JOIN employee_profiles ep ON ep.employee_id = e.id
WHERE pr.employee_id = $1
ORDER BY pr.review_date DESC
LIMIT 5;
