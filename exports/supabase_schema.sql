-- ═══════════════════════════════════════════════════════════════════════
-- BPUT CUPGS Academic Feedback Manager — Supabase Database Schema
-- Run this entire script in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 1. DEPARTMENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  hod_name TEXT,
  hod_employee_id TEXT UNIQUE,
  hod_pin TEXT
);

-- ─── 2. FACULTY ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faculty (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  designation TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  employee_id TEXT UNIQUE,
  login_pin TEXT,
  qualification TEXT,
  specialization TEXT,
  photo_url TEXT
);

-- ─── 3. FACULTY LIKES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faculty_likes (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER NOT NULL REFERENCES faculty(id),
  session_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── 4. COURSES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  faculty_id INTEGER REFERENCES faculty(id),
  semester INTEGER NOT NULL,
  academic_year TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 3
);

-- ─── 5. FEEDBACK ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  reference_id TEXT NOT NULL UNIQUE,
  course_id INTEGER NOT NULL REFERENCES courses(id),
  faculty_id INTEGER REFERENCES faculty(id),
  department_id INTEGER NOT NULL REFERENCES departments(id),
  semester INTEGER NOT NULL,
  academic_year TEXT NOT NULL,
  student_year INTEGER,
  section TEXT,
  feedback_type TEXT DEFAULT 'semester_end',
  rating_course_content REAL NOT NULL,
  rating_teaching_quality REAL NOT NULL,
  rating_lab_facilities REAL NOT NULL,
  rating_study_material REAL NOT NULL,
  rating_overall REAL NOT NULL,
  comments TEXT,
  custom_answers JSONB,
  is_anonymous BOOLEAN DEFAULT TRUE,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── 6. FEEDBACK WINDOWS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback_windows (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  feedback_type TEXT DEFAULT 'semester_end',
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  department_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── 7. FORM TEMPLATES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS form_templates (
  id SERIAL PRIMARY KEY,
  department_id INTEGER NOT NULL UNIQUE REFERENCES departments(id),
  title TEXT DEFAULT 'Student Feedback Form',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  fields JSONB,
  comment_label TEXT DEFAULT 'Additional Comments / Suggestions',
  comment_required BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ─── 8. COMPLAINTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  reference_id TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_remarks TEXT,
  hod_remarks TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);


-- ═══════════════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department_id);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_courses_faculty ON courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_feedback_course ON feedback(course_id);
CREATE INDEX IF NOT EXISTS idx_feedback_faculty ON feedback(faculty_id);
CREATE INDEX IF NOT EXISTS idx_feedback_department ON feedback(department_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reference ON feedback(reference_id);
CREATE INDEX IF NOT EXISTS idx_feedback_academic_year ON feedback(academic_year);
CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints(department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_reference ON complaints(reference_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_faculty_likes_faculty ON faculty_likes(faculty_id);
CREATE INDEX IF NOT EXISTS idx_feedback_windows_active ON feedback_windows(is_active);


-- ═══════════════════════════════════════════════════════════════════════
-- SEED DATA — DEPARTMENTS
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO departments (code, name, hod_name, hod_employee_id, hod_pin) VALUES
  ('CSE', 'Computer Science & Engineering', 'Dr. Debashreet Das', 'HOD/CSE/001', 'HD4X7A'),
  ('ECE', 'Electronics & Communication Engineering', 'Dr. Prakash Kumar Panda', 'HOD/ECE/001', 'HD8Y3B'),
  ('EE', 'Electrical Engineering', 'Dr. Manas Ranjan Nayak', 'HOD/EE/001', 'HD2Z6C'),
  ('ME', 'Mechanical Engineering', 'Dr. Atal Bihari Harichandan', 'HOD/ME/001', 'HD6W9D'),
  ('CE', 'Civil Engineering', 'Dr. Bibhuti Bhusan Mukharjee', 'HOD/CE/001', 'HD3V5E')
ON CONFLICT (code) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════
-- SEED DATA — FACULTY
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO faculty (name, designation, department_id, employee_id, login_pin, qualification, specialization, photo_url) VALUES
  -- CSE Department
  ('Dr. Debashreet Das', 'Associate Professor', (SELECT id FROM departments WHERE code='CSE'), 'CUPGS/CSE/001', 'FP7K2M', 'B.E.(I.T.), M.Tech(CSE), PhD(CSE)', 'Data Structures & Algorithms', 'https://www.bput.ac.in/images/faculty/Debashreet-Das.jpg'),
  ('Dr. Pradip Kumar Sahu', 'Professor', (SELECT id FROM departments WHERE code='CSE'), 'CUPGS/CSE/002', 'FP3N8Q', 'B.E., M.E., Ph.D.', 'Embedded Systems, VLSI, Network-on-Chip, Cloud Computing, Image Processing', 'https://www.bput.ac.in/images/faculty/faculty_cb5f5443640592634bf3865a64515ced.jpg'),
  ('Dr. Sumitra Kisan', 'Professor', (SELECT id FROM departments WHERE code='CSE'), 'CUPGS/CSE/003', 'FP9R4W', 'B.Tech, M.Tech, Ph.D.', 'Cryptography & Network Security, Fractal Analysis, Pattern Recognition, Steganography', 'https://www.bput.ac.in/images/faculty/faculty_d9dc7fda64e62046401193fa2f7c0730.jpg'),
  ('Shiba Prasad Dash', 'Assistant Professor', (SELECT id FROM departments WHERE code='CSE'), 'CUPGS/CSE/004', 'FP5T6X', 'B.Tech, M.Tech', 'Data Structures & Algorithms', 'https://www.bput.ac.in/images/faculty/faculty_1473675614.jpg'),
  ('Dr. D Chandrasekhar Rao', 'Associate Professor', (SELECT id FROM departments WHERE code='CSE'), 'CUPGS/CSE/005', 'FP2V8Y', 'B.Tech, M.Tech, Ph.D.', 'Computer Science & Engineering', 'https://www.bput.ac.in/images/faculty/faculty_11072024csecsrao.jpg'),

  -- ECE Department
  ('Dr. Prakash Kumar Panda', 'Associate Professor', (SELECT id FROM departments WHERE code='ECE'), 'CUPGS/ECE/001', 'FP4A7D', 'M.Tech, Ph.D.', 'Electronics & Communication Engineering', 'https://www.bput.ac.in/images/faculty/Dr-Prakash-Kumar-Panda.jpg'),
  ('Dr. Bikramaditya Das', 'Associate Professor', (SELECT id FROM departments WHERE code='ECE'), 'CUPGS/ECE/002', 'FP6B3G', 'Ph.D., M.Tech, B.Tech', 'Wireless Communication, Adaptive Control, Control of Underwater Vehicles, Robotics', 'https://www.bput.ac.in/images/faculty/Dr-Bikramaditya-Das.jpg'),
  ('Dr. Ashish Kumar Padhan', 'Assistant Professor', (SELECT id FROM departments WHERE code='ECE'), 'CUPGS/ECE/003', 'FP8C5H', 'Ph.D., M.Tech', 'Electronics & Communication Engineering', 'https://www.bput.ac.in/images/faculty/Dr-Ashish-Kumar-Padhan.jpg'),

  -- EE Department
  ('Dr. Manas Ranjan Nayak', 'Professor', (SELECT id FROM departments WHERE code='EE'), 'CUPGS/EE/001', 'FP1E9J', 'Ph.D., M.E., B.E.', 'Renewable Energy Integration, Energy Storage, Electric Vehicle, Smart Grid', 'https://www.bput.ac.in/images/faculty/faculty_1553404001.jpg'),
  ('Dr. Sivkumar Mishra', 'Professor', (SELECT id FROM departments WHERE code='EE'), 'CUPGS/EE/002', 'FP7F2L', 'Ph.D., M.Tech, B.E.', 'Power Distribution System, Distributed Generation, Micro Grids, Soft Computing in Power Systems', 'https://www.bput.ac.in/images/faculty/faculty_1553764269.jpg'),
  ('Dr. Manoj Kumar Sahu', 'Associate Professor', (SELECT id FROM departments WHERE code='EE'), 'CUPGS/EE/003', 'FP3G6N', 'B.E., M.Tech, Ph.D.', 'Power Electronics & Electrical Drives, Renewable Energy Systems', 'https://www.bput.ac.in/images/faculty/faculty_1473767496.jpg'),
  ('Dr. Saswata Satpathi', 'Assistant Professor', (SELECT id FROM departments WHERE code='EE'), 'CUPGS/EE/004', 'FP9H4P', 'Ph.D.', 'Electrical Engineering', 'https://www.bput.ac.in/images/faculty/Dr.SaswataSatpathi-EE.jpg'),

  -- ME Department
  ('Dr. Atal Bihari Harichandan', 'Associate Professor', (SELECT id FROM departments WHERE code='ME'), 'CUPGS/ME/001', 'FP5K8R', 'B.E., M.Tech, Ph.D.', 'Computational Fluid Dynamics, Aerodynamics, Gas Dynamics, Carbon Capture, Aeroacoustics', 'https://www.bput.ac.in/images/faculty/Dr-Atal-Bihari-Harichandan.jpg'),
  ('Dr. Nirmal Kumar Kund', 'Professor', (SELECT id FROM departments WHERE code='ME'), 'CUPGS/ME/002', 'FP2L3S', 'Ph.D., M.Tech., B.Tech.', 'Alloys & Composites, Casting & Solidification, CFD, Semisolid Materials Processing', 'https://www.bput.ac.in/images/faculty/faculty_aef8a66974b2bbc95e670bf6df07a6b3.jpg'),
  ('Dr. Pradeep Kumar Mishra', 'Associate Professor', (SELECT id FROM departments WHERE code='ME'), 'CUPGS/ME/003', 'FP6M7T', 'B.E., M.Tech, Ph.D.', 'Mechanics of Materials, Applied Thermodynamics', 'https://www.bput.ac.in/images/faculty/faculty_1550899236.bmp'),

  -- CE Department
  ('Dr. Bibhuti Bhusan Mukharjee', 'Associate Professor', (SELECT id FROM departments WHERE code='CE'), 'CUPGS/CE/001', 'FP4N9U', 'B.E., M.Tech, Ph.D.', 'Concrete Technology, Sustainable Materials and Technologies', 'https://www.bput.ac.in/images/faculty/faculty_1545273815.jpg'),
  ('Dr. Madhusmita Biswal', 'Assistant Professor', (SELECT id FROM departments WHERE code='CE'), 'CUPGS/CE/002', 'FP8P2V', 'B.Tech, M.Tech, Ph.D.', 'Structural Dynamics, Composite Structures, Vibration and Stability of Plates & Shells', 'https://www.bput.ac.in/images/faculty/faculty_1545361720.jpg'),
  ('Dr. Bharadwaj Nanda', 'Associate Professor', (SELECT id FROM departments WHERE code='CE'), 'CUPGS/CE/003', 'FP1Q5W', 'B.Tech, M.Tech, Ph.D.', 'Building Engineering, Construction Technology', 'https://www.bput.ac.in/images/faculty/Dr.Bharadwaj-Nanda.jpg')
ON CONFLICT (employee_id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════
-- SEED DATA — COURSES (Academic Year 2025-26)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO courses (code, name, department_id, faculty_id, semester, academic_year, credits) VALUES
  -- CSE Courses
  ('CS301', 'Data Structures & Algorithms', (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CSE/001'), 3, '2025-26', 4),
  ('CS401', 'Design & Analysis of Algorithms', (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CSE/001'), 4, '2025-26', 4),
  ('CS601', 'Machine Learning', (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CSE/001'), 6, '2025-26', 3),
  ('CS501', 'Cloud Computing', (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CSE/002'), 5, '2025-26', 3),
  ('CS404', 'Computer Networks', (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CSE/002'), 4, '2025-26', 4),
  ('CS701', 'Internet of Things', (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CSE/002'), 7, '2025-26', 3),
  ('CS502', 'Cryptography & Network Security', (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CSE/003'), 5, '2025-26', 3),
  ('CS303', 'Theory of Computation', (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CSE/003'), 3, '2025-26', 3),
  ('CS702', 'Information Security', (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CSE/003'), 7, '2025-26', 3),
  ('CS101', 'Programming in C', (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CSE/004'), 1, '2025-26', 3),
  ('CS201', 'Object Oriented Programming (Java)', (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CSE/004'), 2, '2025-26', 4),
  ('CS403', 'Database Management Systems', (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CSE/005'), 4, '2025-26', 4),
  ('CS503', 'Software Engineering', (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CSE/005'), 5, '2025-26', 3),
  ('CS602', 'Web Technology', (SELECT id FROM departments WHERE code='CSE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CSE/005'), 6, '2025-26', 3),

  -- ECE Courses
  ('EC401', 'Digital Signal Processing', (SELECT id FROM departments WHERE code='ECE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ECE/001'), 4, '2025-26', 4),
  ('EC301', 'Electromagnetic Theory', (SELECT id FROM departments WHERE code='ECE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ECE/001'), 3, '2025-26', 3),
  ('EC501', 'VLSI Design', (SELECT id FROM departments WHERE code='ECE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ECE/001'), 5, '2025-26', 3),
  ('EC502', 'Wireless Communication', (SELECT id FROM departments WHERE code='ECE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ECE/002'), 5, '2025-26', 4),
  ('EC402', 'Control Systems', (SELECT id FROM departments WHERE code='ECE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ECE/002'), 4, '2025-26', 4),
  ('EC601', 'Robotics & Automation', (SELECT id FROM departments WHERE code='ECE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ECE/002'), 6, '2025-26', 3),
  ('EC201', 'Analog Electronics', (SELECT id FROM departments WHERE code='ECE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ECE/003'), 2, '2025-26', 4),
  ('EC302', 'Digital Electronics', (SELECT id FROM departments WHERE code='ECE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ECE/003'), 3, '2025-26', 4),

  -- EE Courses
  ('EE501', 'Renewable Energy Systems', (SELECT id FROM departments WHERE code='EE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/EE/001'), 5, '2025-26', 3),
  ('EE601', 'Electric Vehicles & Energy Management', (SELECT id FROM departments WHERE code='EE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/EE/001'), 6, '2025-26', 3),
  ('EE401', 'Power Systems Analysis', (SELECT id FROM departments WHERE code='EE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/EE/001'), 4, '2025-26', 4),
  ('EE602', 'Smart Grid Technologies', (SELECT id FROM departments WHERE code='EE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/EE/002'), 6, '2025-26', 3),
  ('EE502', 'Power Distribution System', (SELECT id FROM departments WHERE code='EE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/EE/002'), 5, '2025-26', 4),
  ('EE403', 'Power Electronics', (SELECT id FROM departments WHERE code='EE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/EE/003'), 4, '2025-26', 4),
  ('EE503', 'Electrical Drives', (SELECT id FROM departments WHERE code='EE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/EE/003'), 5, '2025-26', 3),
  ('EE301', 'Electrical Machines', (SELECT id FROM departments WHERE code='EE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/EE/004'), 3, '2025-26', 4),
  ('EE201', 'Circuit Theory & Networks', (SELECT id FROM departments WHERE code='EE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/EE/004'), 2, '2025-26', 4),

  -- ME Courses
  ('ME501', 'Computational Fluid Dynamics', (SELECT id FROM departments WHERE code='ME'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ME/001'), 5, '2025-26', 3),
  ('ME401', 'Fluid Mechanics', (SELECT id FROM departments WHERE code='ME'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ME/001'), 4, '2025-26', 4),
  ('ME601', 'Gas Dynamics & Aerodynamics', (SELECT id FROM departments WHERE code='ME'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ME/001'), 6, '2025-26', 3),
  ('ME301', 'Materials Science & Engineering', (SELECT id FROM departments WHERE code='ME'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ME/002'), 3, '2025-26', 3),
  ('ME402', 'Manufacturing Technology', (SELECT id FROM departments WHERE code='ME'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ME/002'), 4, '2025-26', 4),
  ('ME502', 'Casting, Forming & Welding', (SELECT id FROM departments WHERE code='ME'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ME/002'), 5, '2025-26', 3),
  ('ME201', 'Engineering Mechanics', (SELECT id FROM departments WHERE code='ME'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ME/003'), 2, '2025-26', 4),
  ('ME302', 'Applied Thermodynamics', (SELECT id FROM departments WHERE code='ME'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ME/003'), 3, '2025-26', 4),
  ('ME403', 'Mechanics of Materials', (SELECT id FROM departments WHERE code='ME'), (SELECT id FROM faculty WHERE employee_id='CUPGS/ME/003'), 4, '2025-26', 3),

  -- CE Courses
  ('CE501', 'Concrete Technology', (SELECT id FROM departments WHERE code='CE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CE/001'), 5, '2025-26', 3),
  ('CE401', 'Structural Analysis', (SELECT id FROM departments WHERE code='CE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CE/001'), 4, '2025-26', 4),
  ('CE601', 'Design of RCC Structures', (SELECT id FROM departments WHERE code='CE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CE/001'), 6, '2025-26', 4),
  ('CE502', 'Structural Dynamics', (SELECT id FROM departments WHERE code='CE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CE/002'), 5, '2025-26', 3),
  ('CE301', 'Mechanics of Structures', (SELECT id FROM departments WHERE code='CE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CE/002'), 3, '2025-26', 4),
  ('CE602', 'Composite Materials in Civil Engineering', (SELECT id FROM departments WHERE code='CE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CE/002'), 6, '2025-26', 3),
  ('CE201', 'Building Materials & Construction', (SELECT id FROM departments WHERE code='CE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CE/003'), 2, '2025-26', 3),
  ('CE302', 'Surveying & Geomatics', (SELECT id FROM departments WHERE code='CE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CE/003'), 3, '2025-26', 3),
  ('CE402', 'Geotechnical Engineering', (SELECT id FROM departments WHERE code='CE'), (SELECT id FROM faculty WHERE employee_id='CUPGS/CE/003'), 4, '2025-26', 4);


-- ═══════════════════════════════════════════════════════════════════════
-- ENABLE ROW LEVEL SECURITY (optional but recommended for Supabase)
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Allow public read on faculty" ON faculty FOR SELECT USING (true);
CREATE POLICY "Allow public read on courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Allow public read on feedback" ON feedback FOR SELECT USING (true);
CREATE POLICY "Allow public read on feedback_windows" ON feedback_windows FOR SELECT USING (true);
CREATE POLICY "Allow public read on form_templates" ON form_templates FOR SELECT USING (true);
CREATE POLICY "Allow public read on complaints" ON complaints FOR SELECT USING (true);
CREATE POLICY "Allow public read on faculty_likes" ON faculty_likes FOR SELECT USING (true);

CREATE POLICY "Allow public insert on feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on complaints" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on faculty_likes" ON faculty_likes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on complaints" ON complaints FOR UPDATE USING (true);
CREATE POLICY "Allow public update on departments" ON departments FOR UPDATE USING (true);
CREATE POLICY "Allow public update on faculty" ON faculty FOR UPDATE USING (true);
CREATE POLICY "Allow public update on courses" ON courses FOR UPDATE USING (true);
CREATE POLICY "Allow public update on feedback_windows" ON feedback_windows FOR UPDATE USING (true);
CREATE POLICY "Allow public update on form_templates" ON form_templates FOR UPDATE USING (true);

CREATE POLICY "Allow public insert on feedback_windows" ON feedback_windows FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on form_templates" ON form_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on faculty" ON faculty FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on courses" ON courses FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete on faculty" ON faculty FOR DELETE USING (true);
CREATE POLICY "Allow public delete on courses" ON courses FOR DELETE USING (true);
CREATE POLICY "Allow public delete on feedback" ON feedback FOR DELETE USING (true);
CREATE POLICY "Allow public delete on feedback_windows" ON feedback_windows FOR DELETE USING (true);


-- ═══════════════════════════════════════════════════════════════════════
-- DONE! All 8 tables created with seed data for 5 departments,
-- 18 faculty members, and 47 courses.
-- ═══════════════════════════════════════════════════════════════════════
