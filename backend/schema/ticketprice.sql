CREATE TABLE IF NOT EXISTS ticketprice (
  TicketType varchar(255) NOT NULL,
  Price decimal(8,2) NOT NULL,
  UpdatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (TicketType),
  CONSTRAINT chk_ticketprice_price CHECK (Price > 0),
  CONSTRAINT chk_ticketprice_type CHECK (
    TicketType IN ('Adult', 'Senior', 'Student', 'Child')
  )
);

INSERT INTO ticketprice (TicketType, Price) VALUES
  ('Adult', 25.00),
  ('Senior', 20.00),
  ('Student', 15.00),
  ('Child', 15.00)
ON DUPLICATE KEY UPDATE
  Price = VALUES(Price);

ALTER TABLE ticket
  ADD COLUMN SchoolEmail varchar(255) NULL
  AFTER CustomerID;
