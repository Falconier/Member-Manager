---- Assuming category_ids: 1=Worship, 2=Church Care, 3=Music Ministry, etc.
--INSERT INTO Talents (talent_name, category_id) VALUES
--('Usher',1),
--('Children''s Messages', 1),
--('Communion Help',1),
--('Help with AV',1),
--('Help with Pews',1),
--('Greeter',1),
--('Lay Reader',1),
--('Diener',1),

--('Visitation - Sick/Shut-in',2),
--('Visitation - Nursing Home',2),
--('Visitation - Hospital',2),
--('Meal Help - In Need',2),
--('Meal Help - Funeral',2),
--('Church Maintenance - Outdoor',2),
--('Church Maintenance - Indoor',2),
--('Building Maintenance',2),
--('Snow Plan',2),
--('Provide Transportation',2),
--('Shepherd New Members',2),

--('Serve on Provencial Board or Committee',3),
--('Laural Ridge - Work Days',3),
--('Laurel Ridge - Counselor',3),

--('Office Assistance',4),
--('Temp Secretary',4),
--('Sunday Prep',4),
--('Church Mailings',4),

--('Sunday School',5),
--('Bible Study',5),
--('Youth Fellowship',5),
--('Men''s Fellowship',5),
--('Women''s Fellowship',5),

--('Sing in Choir',6),
--('Help with Youth Choir',6),
--('Play in Church Band',6),
--('Play handbells',6),
--('Musician Services',6),

--('Nursery - Sundays',7),
--('Bible Time',7),
--('Children''s Church',7),
--('Nursery - Other Events',7),

--('Contact First Time Visitors',8),
--('Help with Outreach Events',8),
--('Help with Share the Blessing Mission',8),
--('Help with Blessing Box',8),
--('Serve on missions',8),

--('Sunday School Teacher',9),
--('Sunday School Helper',9),
--('Bible Study Leader',9),
--('Help with VBS',9),
--('VBS Director',9),
--('VBS Teacher',9),
--('VBS Helper',9),

--('Prayer Needs',10),
--('Pastor''s Prayer Partner',10),
--('Prayer Watch',10),

--('Help with Church Events',11),
--('Help with Fundraisers',11),
--('Help with Easter Breakfast',11),
--('Help with Church Bazaar',11),
--('Help with Men''s Brunswick Stew',11),
--('Help Trim Candles',11)


select * from KMCsandbox.dbo.TalentCategories
select * from KMCsandbox.dbo.Talents t join KMCsandbox.dbo.TalentCategories tc on t.category_id = tc.category_id