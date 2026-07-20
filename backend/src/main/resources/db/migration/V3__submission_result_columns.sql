ALTER TABLE submission_results
ADD COLUMN actual_output LONGTEXT NULL,
ADD COLUMN expected_output LONGTEXT NULL,
ADD COLUMN error_message LONGTEXT NULL;