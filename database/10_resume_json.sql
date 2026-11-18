-- =====================================================================
-- 10_resume_json.sql
-- Course 5, Module 2 (Lab A): every section of resume.json, built by
-- MySQL's own JSON functions.
--
-- READ-ONLY: this script only SELECTs. It is NOT part of the rebuild order.
-- Run as root (or the lab admin user): the queries read base tables,
-- which portfolio_web cannot see.
--
-- How to use: run one query at a time. In the Result Grid, right-click the
-- single cell -> Copy Field (unquoted), and paste it into the matching
-- section of data/resume.json.
--
-- The JSON keys are the resume.json CONTRACT (slide 16). The page, and from
-- Day 3 the API, are written against exactly these keys. Do not rename them.
--
-- The order trap (slide 15): JSON_ARRAYAGG does not guarantee the order of
-- its elements, so every element carries its sort key (start_date, year)
-- and the page sorts.
-- =====================================================================

USE future_portfolio_db;

-- ---------------------------------------------------------------------
-- 1. profile: one object. Four keys. NOT email: the file is published.
-- Expected: 1 row; full_name "Ananya Rao"
-- ---------------------------------------------------------------------
SELECT JSON_PRETTY(
         JSON_OBJECT('full_name', p.full_name,
                     'headline',  p.headline,
                     'location',  p.location,
                     'summary',   p.professional_summary)) AS profile_json
FROM people AS p
WHERE p.person_id = 1;

-- ---------------------------------------------------------------------
-- 2. summary: one object built from Course 4's scalar subqueries
--    (v_career_summary) and RQ15's career-years calculation.
-- Expected: 7 / 17 / 16 / 17 / 19 / 40.0000
-- ---------------------------------------------------------------------
SELECT JSON_PRETTY(
         JSON_OBJECT('companies',    (SELECT COUNT(*) FROM companies),
                     'roles',        (SELECT COUNT(*) FROM roles),
                     'projects',     (SELECT COUNT(*) FROM projects),
                     'skills',       (SELECT COUNT(*) FROM skills),
                     'awards',       (SELECT COUNT(*) FROM awards),
                     'career_years', (SELECT SUM(TIMESTAMPDIFF(MONTH, e.start_date, e.end_date) + 1) / 12
                                      FROM employment AS e))) AS summary_json;

-- ---------------------------------------------------------------------
-- 3. experience: an array of objects, one per role. Raw ISO dates (the
--    page formats them); team_size a number or null.
-- Expected: 1 row containing an array of 17
-- ---------------------------------------------------------------------
SELECT JSON_PRETTY(
         JSON_ARRAYAGG(
           JSON_OBJECT('company',    c.company_name,
                       'role',       r.role_title,
                       'start_date', r.start_date,
                       'end_date',   r.end_date,
                       'team_size',  r.team_size))) AS experience_json
FROM roles      AS r
JOIN employment AS e ON e.employment_id = r.employment_id
JOIN companies  AS c ON c.company_id    = e.company_id;

-- ---------------------------------------------------------------------
-- 4. projects: an array of objects, each with a nested array of skills
--    (a correlated subquery, Course 4 Module 7). One element per
--    role-project pair, exactly like v_projects_section.
-- Expected: an array of 18 (projects 3 and 7 were delivered by two roles)
-- ---------------------------------------------------------------------
SELECT JSON_PRETTY(
         JSON_ARRAYAGG(
           JSON_OBJECT('project',    p.project_name,
                       'role',       r.role_title,
                       'company',    c.company_name,
                       'skills',     (SELECT JSON_ARRAYAGG(s.skill_name)
                                      FROM project_skills AS ps
                                      JOIN skills AS s ON s.skill_id = ps.skill_id
                                      WHERE ps.project_id = p.project_id)))) AS projects_json
FROM role_projects AS rp
JOIN projects      AS p ON p.project_id    = rp.project_id
JOIN roles         AS r ON r.role_id       = rp.role_id
JOIN employment    AS e ON e.employment_id = r.employment_id
JOIN companies     AS c ON c.company_id    = e.company_id;

-- ---------------------------------------------------------------------
-- 5. skills: an array of objects with the evidence count (v_skill_evidence's
--    LEFT JOIN, so skills with no project still appear with 0).
-- Expected: an array of 17; two skills have project_count 0
-- ---------------------------------------------------------------------
SELECT JSON_PRETTY(
         JSON_ARRAYAGG(
           JSON_OBJECT('skill',         v.skill_name,
                       'category',      v.skill_category,
                       'project_count', v.project_count))) AS skills_json
FROM (SELECT s.skill_name, s.skill_category, COUNT(ps.project_id) AS project_count
      FROM skills AS s
      LEFT JOIN project_skills AS ps ON ps.skill_id = s.skill_id
      GROUP BY s.skill_id, s.skill_name, s.skill_category) AS v;

-- ---------------------------------------------------------------------
-- 6. education: an array of objects. Years as numbers (YEAR -> number);
--    the page decides how to show "2025" or "1983 - 1987".
-- Expected: an array of 4
-- ---------------------------------------------------------------------
SELECT JSON_PRETTY(
         JSON_ARRAYAGG(
           JSON_OBJECT('qualification', ed.qualification,
                       'institution',   ed.institution,
                       'type',          ed.education_type,
                       'start_year',    ed.start_year,
                       'end_year',      ed.end_year))) AS education_json
FROM education AS ed;

-- ---------------------------------------------------------------------
-- 7. awards: an array of objects. awarding_body is NOT NULL and, for
--    employer awards, already holds the employer's name, so it gives the
--    same text as v_awards_section's COALESCE(c.company_name, ...).
-- Expected: an array of 19 (Company 9, Industry 7, Community 3)
-- ---------------------------------------------------------------------
SELECT JSON_PRETTY(
         JSON_ARRAYAGG(
           JSON_OBJECT('award',      a.award_name,
                       'awarded_by', a.awarding_body,
                       'year',       a.award_year,
                       'category',   a.award_category))) AS awards_json
FROM awards AS a;

-- ---------------------------------------------------------------------
-- 8. My own extra key (individual evidence, Lab A).
--    Reference example: months in each role, from TIMESTAMPDIFF (the same
--    calculation as Course 4's v_role_details). It is tried here and NOT
--    pasted into data/resume.json: the contract (slide 16) is shared by the
--    page and, from Day 3, the API, so a new key is agreed before it is added.
--    Clients ignore unknown keys, so adding it later would not break the page.
-- Expected: an array of 17; Lumina CTO 60 months
-- ---------------------------------------------------------------------
SELECT JSON_PRETTY(
         JSON_ARRAYAGG(
           JSON_OBJECT('role',   r.role_title,
                       'months', TIMESTAMPDIFF(MONTH, r.start_date, r.end_date) + 1))) AS months_json
FROM roles AS r;
