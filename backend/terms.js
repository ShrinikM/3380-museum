function joinCurrentTerm(membershipAlias, joinType = "JOIN") {
  return `${joinType} membershipterm term
    ON term.TermID = (
      SELECT latest.TermID
      FROM membershipterm latest
      WHERE latest.MembershipID = ${membershipAlias}.MembershipID
      ORDER BY latest.TermID DESC
      LIMIT 1
    )`;
}

const termStatus = `CASE
    WHEN term.CancelledAt IS NOT NULL THEN 'cancelled'
    WHEN term.EndDate < CURDATE() THEN 'expired'
    WHEN term.StartDate > CURDATE() THEN 'upcoming'
    ELSE 'active'
  END`;

const activeTerm = `term.CancelledAt IS NULL
    AND term.StartDate <= CURDATE()
    AND term.EndDate >= CURDATE()`;

module.exports = { joinCurrentTerm, termStatus, activeTerm };
