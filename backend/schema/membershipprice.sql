-- Membership plan catalog (like ticketprice).
-- Run this on an existing museum database.

CREATE TABLE IF NOT EXISTS membershipprice (
  MembershipType varchar(255) NOT NULL,
  Price decimal(8,2) NOT NULL,
  DiscountPercent decimal(5,2) NOT NULL DEFAULT 0.00,
  GiftShopDiscount decimal(5,2) NOT NULL DEFAULT 0.00,
  CafeDiscount decimal(5,2) NOT NULL DEFAULT 0.00,
  AdultTicketLimit int NOT NULL DEFAULT 0,
  ChildTicketLimit int NOT NULL DEFAULT 0,
  StudentTicketLimit int NOT NULL DEFAULT 0,
  SeniorTicketLimit int NOT NULL DEFAULT 0,
  CreatedAt datetime NOT NULL,
  UpdatedAt datetime NOT NULL,
  CreatedBy bigint unsigned DEFAULT NULL,
  PRIMARY KEY (MembershipType),
  KEY fk_membershipprice_createdby (CreatedBy),
  CONSTRAINT fk_membershipprice_createdby
    FOREIGN KEY (CreatedBy) REFERENCES staff (StaffID),
  CONSTRAINT chk_membershipprice_price CHECK (Price > 0),
  CONSTRAINT chk_membershipprice_discount CHECK (DiscountPercent BETWEEN 0 AND 100),
  CONSTRAINT chk_membershipprice_giftshop CHECK (GiftShopDiscount BETWEEN 0 AND 100),
  CONSTRAINT chk_membershipprice_cafe CHECK (CafeDiscount BETWEEN 0 AND 100),
  CONSTRAINT chk_membershipprice_adult_limit CHECK (AdultTicketLimit >= 0),
  CONSTRAINT chk_membershipprice_child_limit CHECK (ChildTicketLimit >= 0),
  CONSTRAINT chk_membershipprice_student_limit CHECK (StudentTicketLimit >= 0),
  CONSTRAINT chk_membershipprice_senior_limit CHECK (SeniorTicketLimit >= 0),
  CONSTRAINT chk_membershipprice_type CHECK (
    MembershipType IN ('Dual', 'Family', 'Student', 'Senior')
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO membershipprice
  (MembershipType, Price, DiscountPercent, GiftShopDiscount, CafeDiscount,
   AdultTicketLimit, ChildTicketLimit, StudentTicketLimit, SeniorTicketLimit,
   CreatedAt, UpdatedAt, CreatedBy)
VALUES
  ('Dual',    75.00, 25.00, 15.00, 15.00, 2, 0, 0, 0, NOW(), NOW(), NULL),
  ('Family', 150.00, 25.00, 15.00, 15.00, 2, 2, 0, 0, NOW(), NOW(), NULL),
  ('Student', 40.00, 35.00, 20.00, 20.00, 2, 0, 0, 0, NOW(), NOW(), NULL),
  ('Senior',  60.00, 30.00, 20.00, 20.00, 0, 0, 0, 2, NOW(), NOW(), NULL)
ON DUPLICATE KEY UPDATE
  Price = VALUES(Price),
  DiscountPercent = VALUES(DiscountPercent),
  GiftShopDiscount = VALUES(GiftShopDiscount),
  CafeDiscount = VALUES(CafeDiscount),
  AdultTicketLimit = VALUES(AdultTicketLimit),
  ChildTicketLimit = VALUES(ChildTicketLimit),
  StudentTicketLimit = VALUES(StudentTicketLimit),
  SeniorTicketLimit = VALUES(SeniorTicketLimit),
  UpdatedAt = NOW();
