function joinCurrentTerm(membershipAlias, joinType = "JOIN") {
  return `${joinType} membershipterm term
    ON term.TermID = (
      SELECT latest.TermID
      FROM membershipterm latest
      WHERE latest.MembershipID = ${membershipAlias}.MembershipID
      ORDER BY
        CASE
          WHEN latest.StartDate <= CURDATE()
            AND latest.EndDate >= CURDATE() THEN 0
          WHEN latest.CancelledAt IS NULL
            AND latest.StartDate > CURDATE() THEN 1
          ELSE 2
        END,
        latest.StartDate DESC,
        latest.TermID DESC
      LIMIT 1
    )`;
}

const termStatus = `CASE
    WHEN term.EndDate < CURDATE() AND term.CancelledAt IS NOT NULL THEN 'cancelled'
    WHEN term.EndDate < CURDATE() THEN 'expired'
    WHEN term.CancelledAt IS NOT NULL
      AND term.StartDate <= CURDATE()
      AND term.EndDate >= CURDATE() THEN 'ending'
    WHEN term.CancelledAt IS NOT NULL THEN 'cancelled'
    WHEN term.StartDate > CURDATE() THEN 'upcoming'
    ELSE 'active'
  END`;

const activeTerm = `term.StartDate <= CURDATE()
    AND term.EndDate >= CURDATE()`;

module.exports = { joinCurrentTerm, termStatus, activeTerm };
