-- Customer alert acknowledgments (refunds / cancelled exhibitions).
-- Survives across devices; run on an existing museum database.
-- Collation must match the rest of museum (utf8mb4_0900_ai_ci).

CREATE TABLE IF NOT EXISTS customeralertack (
  CustomerID bigint unsigned NOT NULL,
  AlertType varchar(32) NOT NULL,
  AlertKey varchar(255) NOT NULL,
  AcknowledgedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (CustomerID, AlertType, AlertKey),
  KEY idx_customeralertack_customer (CustomerID),
  CONSTRAINT fk_customeralertack_customer
    FOREIGN KEY (CustomerID) REFERENCES customer (CustomerID),
  CONSTRAINT chk_customeralertack_type
    CHECK (AlertType IN ('exhibition', 'refund'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- If the table already exists with the wrong collation, fix it:
ALTER TABLE customeralertack
  CONVERT TO CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

INSERT INTO customeralertack (CustomerID, AlertType, AlertKey, AcknowledgedAt)
SELECT
  t.CustomerID,
  'refund',
  CAST(t.TicketID AS CHAR),
  NOW()
FROM ticket t
WHERE t.CustomerID IS NOT NULL
  AND t.IsDeleted = 0
  AND t.RefundStatus = 'Refunded'
  AND t.UpdatedAt < DATE_SUB(NOW(), INTERVAL 30 DAY)
ON DUPLICATE KEY UPDATE AcknowledgedAt = AcknowledgedAt;
