-- Customer logins. Each customer account belongs to one membership,
-- the same way staffcredentials belongs to one staff member.

CREATE TABLE customercredentials (
  MembershipID bigint unsigned NOT NULL,
  Username varchar(255) NOT NULL,
  Password varchar(255) NOT NULL,
  CreatedAt datetime NOT NULL,
  UpdatedAt datetime NOT NULL,
  PRIMARY KEY (MembershipID),
  UNIQUE KEY uq_customercredentials_username (Username),
  CONSTRAINT fk_customercredentials_membership
    FOREIGN KEY (MembershipID) REFERENCES membership (MembershipID)
);

-- Demo customer. Replace 1 with the MembershipID of an active membership.
-- Do not use a username that already exists in staffcredentials.
INSERT INTO customercredentials (MembershipID, Username, Password, CreatedAt, UpdatedAt)
VALUES (1, 'customer', 'customer123', NOW(), NOW());