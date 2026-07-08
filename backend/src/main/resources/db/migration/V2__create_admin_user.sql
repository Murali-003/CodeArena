-- Create admin user with BCrypt hash for "admin123"
INSERT INTO users (username, email, password_hash, role, created_at) 
VALUES ('admin', 'admin@gmail.com', '$2a$10$CdPxYLL.dxKCVCmF0dAnpOcMj7XFQLH/2jW7Q3kJkvcL9UkkGdcGS', 'ADMIN', NOW());
