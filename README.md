# HRM System
## Козелло Владислав 353502
## Функциональные требования к проекту
### Управление пользователями и ролями

1. **Авторизация и аутентификация**: 
	- Пользователи должны входить в систему с помощью **email** и **пароля**.
	- Система должна проверять их учетные данные на основе таблицы `employees`.
	
2. **Управление пользователями (CRUD)**:
	- **Администраторы** должны иметь возможность создавать, просматривать, обновлять и удалять (`CRUD`) учетные записи пользователей.
	- При создании учетной записи необходимо связывать ее с сотрудником из таблицы `employees`.
	- Должна быть возможность назначать пользователям **роли** (**roles**: admin, HR, manager, employee).
	
3. **Система ролей**:
    - **Администратор**: Полный доступ ко всем функциям системы, включая управление пользователями, ролями и журналами аудита.
    - **HR**: Доступ к информации о сотрудниках, отделах, должностях и отпусках. Может создавать и обновлять данные сотрудников и их профили.
    - **Менеджер**: Доступ к информации о сотрудниках, их посещаемости, проектах и может добавлять оценки эффективности.
    - **Сотрудник**: Доступ к своей личной информации, данным об отпусках, посещаемости и проектах. Может запрашивать отпуска.

###  Управление персоналом

1. **Профили сотрудников**:
    - **HR** должен иметь возможность создавать, просматривать, обновлять и удалять профили сотрудников (`employees`, `employee_profiles`).
    - Профиль должен содержать основную информацию (имя, дата рождения, email, телефон) и данные о найме (дата приема на работу, паспортные данные, адрес).
    - Сотрудники могут просматривать свой профиль, но не могут его редактировать.
    
2. **Отделы и должности**:
    - **HR** или **Администратор** могут управлять данными об отделах (`departments`), включая их создание и удаление.
    - Должна быть возможность назначать руководителя для каждого отдела.
    
3. **Управление зарплатами**:
    - **Администратор** и **HR** могут просматривать и обновлять информацию о зарплатах (`salaries`).
    - Каждое изменение зарплаты должно регистрироваться с указанием даты вступления в силу.
    
4. **Учет рабочего времени**:
    - Сотрудники должны иметь возможность регистрировать отработанные часы за день (`attendances`).
    - **Менеджер** может просматривать посещаемость сотрудников.
    
5. **Управление отпусками**:
    - Сотрудники могут отправлять запросы на отпуск (`leaves`) с указанием типа отпуска и дат.
    - **HR** должен иметь возможность одобрять или отклонять запросы на отпуск сотрудников.
    - Статус запроса (`LeaveStatus`) должен автоматически обновляться.

### Отчетность и анализ

1. **Журналирование действий пользователя**:
    - Система должна автоматически записывать все **действия (CREATE, UPDATE, DELETE) пользователей** (`audit_logs`) в таблицу.
    - Журнал должен фиксировать тип действия (`action_type`), пользователя, сущность, с которой было взаимодействие (например, `employees`, `projects`), ее идентификатор и временную метку.
    - **Администратор** может просматривать все журналы для аудита.
    
2. **Управление проектами и командами**:
    - **Менеджер** и **Администратор** могут создавать, редактировать и удалять проекты (`projects`).
    - К каждому проекту можно привязывать сотрудников с указанием их роли в проекте (`employee_project`).
    
3. **Оценки эффективности**:
    - **Менеджеры** могут проводить оценки эффективности (`perfomance_reviews`) для своих сотрудников, выставляя оценку и оставляя комментарии.
    -  **Менеджеры** и **HR'ы** могут просматривать свои оценки.

## Сложные запросы для выборки данных

**Выбрать ФИО, должность и email всех сотрудников конкретного отдела**
```SQL
SELECT ep.first_name, 
	   ep.second_name, 
	   ep.middle_name, 
	   p.name AS position, 
	   e.email
FROM employees e
JOIN employee_profiles ep ON e.id = ep.employee_id
JOIN positions p ON p.id = e.position_id
JOIN departments d ON d.id = e.department_id
WHERE d.name = 'IT';
```

**Посчитать общее количество дней отпуска для сотрудников отдела за год**
```SQL
SELECT ep.first_name, 
	   ep.second_name, 
	   ep.middle_name,
	   SUM(l.end_date - l.start_date + 1) as count_of_days
FROM employees e
JOIN leaves l ON l.employee_id = e.id
JOIN employee_profiles ep ON e.id = ep.employee_id
JOIN departments d ON d.id = e.department_id
WHERE leave_type = 'vacation' AND 
	  status = 'approved' AND
	  d.name = 'IT' AND
	  EXTRACT(YEAR FROM l.end_date) = 2025
GROUP BY ep.first_name, ep.second_name, ep.middle_name;
```

**Получить список проектов, в которых участвует сотрудник, и его роль в каждом из них**
```SQL
SELECT
  p.id,
  p.name,
  p.description,
  p.start_date,
  p.end_date,
  pr.name as role,
  ep.assigned_date
FROM employee_projects ep
JOIN projects p ON ep.project_id = p.id
JOIN project_roles pr ON pr.id = ep.role_id
WHERE ep.employee_id = $1
ORDER BY p.start_date DESC
```

**Вычислить сумму и среднее количество в день отработанных часов за месяц для конкретного сотрудника**
```SQL
SELECT AVG(a.worked_hours) as average_per_day,
	   SUM(a.worked_hours) as sum_of_month
FROM attendances a
WHERE EXTRACT(YEAR FROM a.date) = 2025
	  AND EXTRACT(MONTH FROM a.date) = 1
	  AND a.employee_id = (
		  SELECT id FROM employees e
		  JOIN employee_profiles ep ON e.id = ep.employee_id
		  WHERE ep.passport_number = 'MP4567890'
		  );
```

**Выбрать 5 последних оценок производительности для сотрудника, включая имя оценщика (если есть)**
```SQL
SELECT pr.score,
	   pr.comments,
	   pr.review_date,
	   ep.first_name AS reviewer_name
FROM performance_reviews pr
LEFT JOIN employees e ON e.id = pr.reviewer_id
JOIN employee_profiles ep ON ep.employee_id = e.id
WHERE pr.employee_id = (
						SELECT id 
						FROM employees e
						JOIN employee_profiles ep ON ep.employee_id = e.id
						WHERE ep.passport_number = 'MP4567890'
					   )
ORDER BY pr.review_date DESC
LIMIT 5;  
```

**Получить список сотрудников, чья средняя оценка производительности за последние 6 месяцев ниже определенного порога**
```SQL
SELECT 
    ep.employee_id,
    ep.first_name,
    ep.second_name,
    ep.middle_name,
    AVG(pr.score) AS avg_score
FROM performance_reviews pr
JOIN employee_profiles ep ON pr.employee_id = ep.employee_id
WHERE pr.review_date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY 
    ep.employee_id,
    ep.first_name,
    ep.second_name,
    ep.middle_name
HAVING AVG(pr.score) < 10
ORDER BY avg_score ASC;
```

**Проекты, на которые еще не назначен ни один сотрудник**
```SQL
SELECT p.name, p.description, p.start_date
FROM projects
WHERE p.id NOT IN (
	SELECT DISTINCT project_id FROM employee_projects);
```

```SQL
SELECT p.name, p.description, p.start_date
FROM projects p 
LEFT JOIN employee_projects ep ON p.id = ep.project_id 
WHERE ep.employee_id IS NULL;
```

Список всех сотрудников, их последнюю оценку производительности, среднюю оценку по их отделу и ранг сотрудника в его отделе по этой оценке**
```SQL
WITH LatestReview AS (
    SELECT
        pr.employee_id,
        pr.score,
        pr.review_date,
        ROW_NUMBER() OVER (
            PARTITION BY pr.employee_id
            ORDER BY pr.review_date DESC
        ) AS row_num
    FROM performance_reviews pr
)

SELECT
    ep.first_name,
    ep.second_name,
    d.name AS department_name,
    lr.score AS latest_score,
    
    AVG(lr.score) OVER (
        PARTITION BY d.id
    ) AS avg_score,
    
    RANK() OVER (
        PARTITION BY d.id
        ORDER BY lr.score DESC NULLS LAST 
    ) AS emp_rank
FROM employees e
JOIN employee_profiles ep ON e.id = ep.employee_id
JOIN departments d ON e.department_id = d.id
LEFT JOIN LatestReview lr ON e.id = lr.employee_id AND lr.row_num = 1;
```

## Триггеры

**Триггер, не дающий затрекать время в *leave* со статусом "approved".**
```SQL
CREATE OR REPLACE FUNCTION prevent_attendance_during_leave()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM leaves
    WHERE employee_id = NEW.employee_id
      AND NEW.date BETWEEN start_date AND end_date
      AND status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Cannot track attendance during approved leave';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_attendance_during_leave
BEFORE INSERT OR UPDATE ON attendances
FOR EACH ROW
EXECUTE FUNCTION prevent_attendance_during_leave();
```

**Триггер, проверяющий, что сотрудник не может оценить сам себя**
```SQL
CREATE OR REPLACE FUNCTION prevent_self_review()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.employee_id = NEW.reviewer_id THEN
    RAISE EXCEPTION 'Employee cannot review themselves';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_self_review
BEFORE INSERT OR UPDATE ON performance_reviews
FOR EACH ROW
EXECUTE FUNCTION prevent_self_review();
```

**Снятие сотрудника отдела при его удалении**
```SQL
CREATE OR REPLACE FUNCTION delete_department_head()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE departments SET head_id = NULL WHERE head_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_unset_department_head
AFTER DELETE ON employees
FOR EACH ROW
EXECUTE FUNCTION unset_department_head();
```

**Триггер, который проверяет, если записано или обновлено время в последний БУДНИЙ день месяца, то на этот день создается/обновляется запись в salaries для сотрудника. base salary берется с предыдущей записи, если предыдущей записи нет, то ставится нуль. В случае если нет leaves в этом месяце, начисляется бонус +5% от base salary.**
```SQL
CREATE OR REPLACE FUNCTION create_salary_on_month()
RETURNS TRIGGER AS $$
DECLARE
    last_day DATE;
    last_weekday DATE;
    prev_salary MONEY;
    leave_count INT;
    bonus_value MONEY := 0;
BEGIN
    last_day := (date_trunc('month', NEW.date) + interval '1 month - 1 day')::date;

    IF EXTRACT(ISODOW FROM last_day) IN (6, 7) THEN
        last_weekday := last_day - ((EXTRACT(ISODOW FROM last_day)::int - 5));
    ELSE
        last_weekday := last_day;
    END IF;

    IF NEW.date = last_weekday THEN
        SELECT base_salary INTO prev_salary
        FROM salaries
        WHERE employee_id = NEW.employee_id
        ORDER BY salary_date DESC
        LIMIT 1;
        
        IF prev_salary IS NULL THEN
            prev_salary := 0;
        END IF;

        SELECT COUNT(*) INTO leave_count
        FROM leaves
        WHERE employee_id = NEW.employee_id
	        AND date_trunc('month', start_date) = date_trunc('month', NEW.date)
	        AND status = 'approved';

        IF leave_count = 0 THEN
            bonus_value := prev_salary * 0.05;
        END IF;

        INSERT INTO salaries (employee_id, base_salary, bonus, salary_date, currency_id)
        VALUES (
            NEW.employee_id,
            prev_salary,
            bonus_value,
            NEW.date,
            (SELECT id FROM currencies LIMIT 1)
        )
        ON CONFLICT (employee_id, salary_date)
        DO UPDATE SET
            base_salary = EXCLUDED.base_salary,
            bonus = EXCLUDED.bonus;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_process_salary_on_month_end
AFTER INSERT OR UPDATE ON attendances
FOR EACH ROW
EXECUTE FUNCTION process_salary_on_month_end();
```

**Логирование**
```SQL
CREATE OR REPLACE FUNCTION logger()
RETURNS TRIGGER AS $$
DECLARE
    var_action_type_id UUID;
    var_employee_id UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT id INTO var_action_type_id
        FROM action_types
        WHERE name = 'Create'
        LIMIT 1;
    ELSIF TG_OP = 'UPDATE' THEN
        SELECT id INTO var_action_type_id
        FROM action_types
        WHERE name = 'Update'
        LIMIT 1;
    ELSIF TG_OP = 'DELETE' THEN
        SELECT id INTO var_action_type_id
        FROM action_types
        WHERE name = 'Delete'
        LIMIT 1;
    END IF;

    employee_id := NULL;

    INSERT INTO audit_logs (
        employee_id,
        action_type_id,
        entity_name,
        entity_id,
        created_at,
        details
    ) VALUES (
        var_employee_id,
        var_action_type_id,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CURRENT_TIMESTAMP,
        CASE
            WHEN TG_OP = 'INSERT'
	            THEN jsonb_build_object('new', to_jsonb(NEW))
            WHEN TG_OP = 'UPDATE'
	            THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
            WHEN TG_OP = 'DELETE'
	            THEN jsonb_build_object('old', to_jsonb(OLD))
        END
    );
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employees_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW
EXECUTE FUNCTION log_user_action();

CREATE TRIGGER projects_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW
EXECUTE FUNCTION log_user_action();

CREATE TRIGGER attendances_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON attendances
FOR EACH ROW
EXECUTE FUNCTION log_user_action();
```

## Процедуры

**Создание employee вместе с профилем**
```SQL
CREATE PROCEDURE create_full_employee(
    p_email VARCHAR(255),
    p_phone VARCHAR(30),
    p_password_hash VARCHAR(255),
    p_department_id UUID,
    p_user_role_id UUID,
    p_position_id UUID,
    p_passport_number VARCHAR(20),
    p_first_name VARCHAR(255),
    p_second_name VARCHAR(255),
    p_middle_name VARCHAR(255),
    p_birth_date DATE,
    p_hire_date DATE,
    p_address VARCHAR(255),
    p_iban VARCHAR(34)
)
AS $$
DECLARE
    v_employee_id UUID;
BEGIN
    INSERT INTO employees (
        email,
        phone,
        password_hash,
        department_id,
        user_role_id,
        position_id
    ) VALUES (
        p_email,
        p_phone,
        p_password_hash,
        p_department_id,
        p_user_role_id,
        p_position_id
    )
    RETURNING id INTO v_employee_id;

    INSERT INTO employee_profiles (
        passport_number,
        employee_id,
        first_name,
        second_name,
        middle_name,
        hire_date,
        birth_date,
        address,
        iban
    ) VALUES (
        p_passport_number,
        v_employee_id,
        p_first_name,
        p_second_name,
        p_middle_name,
        p_hire_date,
        p_birth_date,
        p_address,
        p_iban
    );
END;
$$ LANGUAGE plpgsql;
```

**Обновление статуса сотрудника**
```SQL
CREATE OR REPLACE PROCEDURE update_employee_status(
    p_employee_id UUID,
    p_new_status employee_status
)
AS $$
    UPDATE employees 
    SET 
        status = p_new_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_employee_id;
$$ LANGUAGE sql;
```

**Функция для расчета зарплаты с бонусом**
```SQL
CREATE FUNCTION get_current_salary(p_employee_id UUID)
RETURNS DECIMAL
AS $$
DECLARE
    total_salary DECIMAL;
BEGIN
    SELECT (base_salary + bonus) INTO total_salary
    FROM salaries 
    WHERE employee_id = p_employee_id 
    ORDER BY salary_date DESC 
    LIMIT 1;
    
    RETURN COALESCE(total_salary, 0);
END;
$$ LANGUAGE plpgsql;
```
```SQL
SELECT 
    first_name,
    second_name,
    get_current_salary(employee_id) as current_salary
FROM employee_profiles;
```
