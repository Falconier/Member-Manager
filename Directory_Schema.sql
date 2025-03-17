USE KMCsandbox

-- Members Table
CREATE TABLE Members (
    member_id INT IDENTITY(1,1) PRIMARY KEY,
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    email NVARCHAR(100),
    phone NVARCHAR(20),
    address NVARCHAR(200),
    zip_code NVARCHAR(10),
    join_date DATE
);

-- TalentCategories Table (New)
CREATE TABLE TalentCategories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    category_name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(200)
);

-- TimeAndTalent Table
CREATE TABLE TimeAndTalent (
    talent_id INT IDENTITY(1,1) PRIMARY KEY, -- This is the record ID, renamed for clarity
    member_id INT NOT NULL,
    category_id INT NOT NULL,
    predefined_talent_id INT NOT NULL, -- New foreign key to Talents
    notes NVARCHAR(200),
    FOREIGN KEY (member_id) REFERENCES Members(member_id),
    FOREIGN KEY (category_id) REFERENCES TalentCategories(category_id),
    FOREIGN KEY (predefined_talent_id) REFERENCES Talents(talent_id)
	);

-- Committees Table
CREATE TABLE Committees (
    committee_id INT IDENTITY(1,1) PRIMARY KEY,
    committee_name NVARCHAR(50) NOT NULL,
    description NVARCHAR(200)
);

-- CommitteeAssignments Table
CREATE TABLE CommitteeAssignments (
    assignment_id INT IDENTITY(1,1) PRIMARY KEY,
    member_id INT NOT NULL,
    committee_id INT NOT NULL,
    role NVARCHAR(50),
    start_date DATE,
    FOREIGN KEY (member_id) REFERENCES Members(member_id),
    FOREIGN KEY (committee_id) REFERENCES Committees(committee_id)
);

-- OtherPositions Table
CREATE TABLE OtherPositions (
    position_id INT IDENTITY(1,1) PRIMARY KEY,
    member_id INT NOT NULL,
    position_name NVARCHAR(50) NOT NULL,
    start_date DATE,
    FOREIGN KEY (member_id) REFERENCES Members(member_id)
);

INSERT INTO TalentCategories (category_name, description)
VALUES 
    ('Worship', 'Roles related to worship services'),
    ('Church Care', 'Tasks for caring for members and facilities'),
    ('Serve Province', 'Service at the provincial level'),
    ('Admin Office', 'Administrative support roles'),
    ('Gift of Time', 'General time-based volunteering'),
    ('Music Ministry', 'Music-related contributions'),
    ('Childrens Ministry', 'Support for childrens programs'),
    ('Outreach Ministry', 'Community outreach efforts'),
    ('Christian Education', 'Educational roles'),
    ('Prayer Ministry', 'Prayer-related support'),
    ('Events and Projects', 'Event planning and execution');

CREATE TABLE Talents (
    talent_id INT IDENTITY(1,1) PRIMARY KEY,
    talent_name NVARCHAR(50) NOT NULL UNIQUE,
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES TalentCategories(category_id)
);

ALTER TABLE Members
ADD city VARCHAR(100),
    state VARCHAR(50);