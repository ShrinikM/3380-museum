-- Capacity is per visit day, not for the whole exhibition.
-- Run this on your museum database after pulling the app changes.

DROP TRIGGER IF EXISTS trg_ticket_before_insert;
DROP TRIGGER IF EXISTS trg_ticket_before_update;

DELIMITER ;;

CREATE TRIGGER trg_ticket_before_insert
BEFORE INSERT ON ticket
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1
        FROM exhibition
        WHERE ExhibitionID = NEW.ExhibitionID
          AND (IsDeleted = 1 OR CancelledAt IS NOT NULL)
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Exhibition is not open for ticket sales';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM exhibition
        WHERE ExhibitionID = NEW.ExhibitionID
          AND EndDate < NEW.SaleDate
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Exhibition has already ended';
    END IF;

    IF NEW.VisitDate IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM exhibition
        WHERE ExhibitionID = NEW.ExhibitionID
          AND IsDeleted = 0
          AND CancelledAt IS NULL
          AND StartDate <= NEW.VisitDate
          AND EndDate >= NEW.VisitDate
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Visit date must be within the exhibition dates';
    END IF;

    IF (
        SELECT COUNT(*)
        FROM ticket
        WHERE ExhibitionID = NEW.ExhibitionID
          AND VisitDate <=> NEW.VisitDate
          AND IsDeleted = 0
          AND RefundStatus <> 'Refunded'
    ) >= (
        SELECT Capacity
        FROM exhibition
        WHERE ExhibitionID = NEW.ExhibitionID
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Exhibition ticket capacity exceeded for that visit date';
    END IF;

    IF NEW.MembershipID IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM membership m
        JOIN membershipterm t
          ON t.MembershipID = m.MembershipID
        WHERE m.MembershipID = NEW.MembershipID
          AND m.IsDeleted = 0
          AND t.CancelledAt IS NULL
          AND NEW.SaleDate BETWEEN t.StartDate AND t.EndDate
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Membership is not active on the sale date';
    END IF;
END;;

CREATE TRIGGER trg_ticket_before_update
BEFORE UPDATE ON ticket
FOR EACH ROW
BEGIN
    IF NEW.IsDeleted = 0
       AND NEW.RefundStatus <> 'Refunded'
       AND (
            OLD.IsDeleted = 1
            OR OLD.RefundStatus = 'Refunded'
            OR NEW.ExhibitionID <> OLD.ExhibitionID
            OR NOT (NEW.VisitDate <=> OLD.VisitDate)
       ) THEN

        IF EXISTS (
            SELECT 1
            FROM exhibition
            WHERE ExhibitionID = NEW.ExhibitionID
              AND CancelledAt IS NOT NULL
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Exhibition is not open for ticket sales';
        END IF;

        IF (
            SELECT COUNT(*)
            FROM ticket
            WHERE ExhibitionID = NEW.ExhibitionID
              AND VisitDate <=> NEW.VisitDate
              AND IsDeleted = 0
              AND RefundStatus <> 'Refunded'
              AND TicketID <> NEW.TicketID
        ) >= (
            SELECT Capacity
            FROM exhibition
            WHERE ExhibitionID = NEW.ExhibitionID
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Exhibition ticket capacity exceeded for that visit date';
        END IF;
    END IF;

    IF NEW.VisitDate IS NOT NULL
       AND (NOT (NEW.VisitDate <=> OLD.VisitDate)
            OR NEW.ExhibitionID <> OLD.ExhibitionID)
       AND NOT EXISTS (
           SELECT 1 FROM exhibition
           WHERE ExhibitionID = NEW.ExhibitionID
             AND IsDeleted = 0
             AND CancelledAt IS NULL
             AND StartDate <= NEW.VisitDate
             AND EndDate >= NEW.VisitDate
       ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Visit date must be within the exhibition dates';
    END IF;

    IF NEW.MembershipID IS NOT NULL
       AND NOT (NEW.MembershipID <=> OLD.MembershipID)
       AND NOT EXISTS (
           SELECT 1
           FROM membership m
           JOIN membershipterm t
             ON t.MembershipID = m.MembershipID
           WHERE m.MembershipID = NEW.MembershipID
             AND m.IsDeleted = 0
             AND t.CancelledAt IS NULL
             AND NEW.SaleDate BETWEEN t.StartDate AND t.EndDate
       ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Membership is not active on the sale date';
    END IF;
END;;

DELIMITER ;
