

INSERT INTO [User]
([id],[name],[gender],[dateOfBirth],[address],[phoneNumber],[email],[status],[pass],[createdAt])
VALUES
(1,'Tracy',1,'2004-05-12',NULL,'0744555888','lucy06072006@gmail.com','active','admin123@','2026-05-28 23:47:28.8533333'),
(11,'Nguyen Van A',1,'2004-05-12','Da Nang','0123456789','a@gmail.com','blocked','123456','2026-05-28 23:38:46.7333333'),
(12,'Nguyen Khanh Van',1,'1999-06-10','45 Nguyen Hoang, Da Nang','012345655','Van100699@gmail.com','active','123456','2026-05-28 23:45:07.1133333'),
(13,'Nguyen Minh Hy',1,'2000-12-10',NULL,'0123456798','blueSky@gmail.com','active','123456','2026-05-28 23:43:36.8266667'),
(14,'Le Dinh Huy',0,'1999-06-10',NULL,'0123456755','alice@gmail.com','active','123456','2026-05-28 23:43:36.8266667'),
(51,N'Ngô Lê Ngọc Trân',0,'2006-07-06',NULL,'0702760525','tracy06072006@gmail.com','active','Ngoctran147','2026-05-28 14:31:54.7705080');

INSERT INTO Staff (id, joinedDate)
VALUES
(11,'2026-05-28'),
(12,'2026-05-28'),
(13,'2026-05-28'),
(14,'2026-05-28');

INSERT INTO Admin (id, joinedDate)
VALUES
(1,'2026-05-28');