-- Self-authored lab, not an official answer. Requires MySQL 8.0+.
-- Run once as a lab administrator on an isolated local MySQL instance.
-- Replace BOTH password placeholders before execution.
-- Existing objects with these names intentionally cause an error.
CREATE DATABASE cs03345_lab;
CREATE TABLE cs03345_lab.staff (
    id INT PRIMARY KEY,
    name VARCHAR(40) NOT NULL
);
INSERT INTO cs03345_lab.staff VALUES (1, 'Alice');

CREATE ROLE 'cs03345_reader'@'localhost',
            'cs03345_editor'@'localhost';
GRANT SELECT ON cs03345_lab.staff
    TO 'cs03345_reader'@'localhost';
GRANT SELECT, INSERT, UPDATE ON cs03345_lab.staff
    TO 'cs03345_editor'@'localhost';

CREATE USER 'cs03345_read'@'localhost'
    IDENTIFIED BY 'REPLACE_WITH_UNIQUE_READER_LAB_PASSWORD';
CREATE USER 'cs03345_edit'@'localhost'
    IDENTIFIED BY 'REPLACE_WITH_UNIQUE_EDITOR_LAB_PASSWORD';
GRANT 'cs03345_reader'@'localhost'
    TO 'cs03345_read'@'localhost';
GRANT 'cs03345_editor'@'localhost'
    TO 'cs03345_edit'@'localhost';
SET DEFAULT ROLE 'cs03345_reader'@'localhost'
    TO 'cs03345_read'@'localhost';
SET DEFAULT ROLE 'cs03345_editor'@'localhost'
    TO 'cs03345_edit'@'localhost';

SHOW GRANTS FOR 'cs03345_read'@'localhost'
    USING 'cs03345_reader'@'localhost';
SHOW GRANTS FOR 'cs03345_edit'@'localhost'
    USING 'cs03345_editor'@'localhost';
