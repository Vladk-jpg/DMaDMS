UPDATE employee_profiles SET 
  picture = $2
WHERE employee_id = $1;