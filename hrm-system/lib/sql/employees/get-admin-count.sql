SELECT COUNT(*) as total
FROM employees e
JOIN roles r ON r.id = e.user_role_id
WHERE r.name = 'Admin' OR r.name = 'HR';

