
const pool = require("../db");

const selectExhibitions = `
  SELECT
    e.ExhibitionID,
    e.Name,
    e.Description,
    DATE_FORMAT(e.StartDate, '%Y-%m-%d') AS StartDate,
    DATE_FORMAT(e.EndDate, '%Y-%m-%d') AS EndDate,
    e.Capacity,
    e.CollectionID,
    c.Name AS CollectionName,

    (SELECT COUNT(*)
     FROM ticket t
     WHERE t.ExhibitionID = e.ExhibitionID
       AND t.IsDeleted = 0) AS Tickets,

    (SELECT COUNT(*)
     FROM artwork a
     WHERE a.CollectionID = e.CollectionID
       AND a.IsDeleted = 0) AS ArtworkCount,

    (SELECT GROUP_CONCAT(
       CONCAT(s.FirstName, ' ', s.LastName)
       ORDER BY s.LastName
       SEPARATOR ','
     )
     FROM exhibitionstaff es
     JOIN staff s ON s.StaffID = es.StaffID
     WHERE es.ExhibitionID = e.ExhibitionID
       AND s.IsDeleted = 0) AS StaffNames,

    CASE
      WHEN e.EndDate < CURDATE() THEN 'completed'
      WHEN e.StartDate <= CURDATE()
        AND e.EndDate >= CURDATE() THEN 'active'
      ELSE 'upcoming'
    END AS Status

  FROM exhibition e
  JOIN collection c
    ON c.CollectionID = e.CollectionID
  WHERE e.IsDeleted = 0
`;

function makeError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function checkId(params) {
  const id = Number(params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    throw makeError(400, "Exhibition id must be a positive integer");
  }

  return id;
}

function checkText(value, fieldName) {
  if (typeof value !== "string") {
    throw makeError(400, fieldName + " must be text");
  }

  const text = value.trim();

  if (text === "") {
    throw makeError(400, fieldName + " is required");
  }

  if (text.length > 255) {
    throw makeError(400, fieldName + " must be 255 characters or fewer");
  }

  return text;
}

function checkExhibition(body) {
  const exhibition = {};

  exhibition.Name = checkText(body.Name, "Name");

  if (typeof body.Description !== "string") {
    throw makeError(400, "Description must be text");
  }

  if (body.Description.trim().length > 255) {
    throw makeError(
      400,
      "Description must be 255 characters or fewer"
    );
  }

  exhibition.Description = body.Description.trim();

  function checkDate(value, fieldName) {
    if (typeof value !== "string") {
      throw makeError(400, fieldName + " must be a date in YYYY-MM-DD format");
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
      throw makeError(400, fieldName + " must be a date in YYYY-MM-DD format");
    }

    const date = new Date(value + "T00:00:00.000Z");

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value ||
      value < "1000-01-01"
    ) {
      throw makeError(400, fieldName + " must be a valid date");
    }

    return value;
  }

  exhibition.StartDate = checkDate(body.StartDate, "StartDate");
  exhibition.EndDate = checkDate(body.EndDate, "EndDate");

  if (exhibition.StartDate >= exhibition.EndDate) {
    throw makeError(400, "EndDate must be after StartDate");
  }

  const capacity = Number(body.Capacity);

  if (
    body.Capacity === "" ||
    body.Capacity === null ||
    body.Capacity === undefined ||
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > 1400
  ) {
    throw makeError(
      400,
      "Capacity must be a whole number between 1 and 1400"
    );
  }

  exhibition.Capacity = capacity;

  const collectionID = Number(body.CollectionID);

  if (
    body.CollectionID === "" ||
    body.CollectionID === null ||
    body.CollectionID === undefined ||
    !Number.isSafeInteger(collectionID) ||
    collectionID < 1
  ) {
    throw makeError(400, "Please select a collection");
  }

  exhibition.CollectionID = collectionID;

  return exhibition;
}

function formatExhibition(row) {
  return {
    ...row,
    Tickets: Number(row.Tickets),
    ArtworkCount: Number(row.ArtworkCount),
    StaffNames: row.StaffNames
      ? row.StaffNames.split(",")
      : [],
    Capacity: Number(row.Capacity),
  };
}

async function findExhibition(id) {
  const [rows] = await pool.query(
    selectExhibitions + " AND e.ExhibitionID = ?",
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  return formatExhibition(rows[0]);
}

async function checkDuplicateName(name, id = null) {
  let sql = `
    SELECT ExhibitionID
    FROM exhibition
    WHERE IsDeleted = 0
      AND LOWER(Name) = LOWER(?)
  `;

  const values = [name];

  if (id !== null) {
    sql += " AND ExhibitionID <> ?";
    values.push(id);
  }

  const [rows] = await pool.query(sql, values);

  if (rows.length > 0) {
    throw makeError(
      409,
      "An exhibition with this name already exists"
    );
  }
}

async function checkCollection(collectionId) {
  const [rows] = await pool.query(
    "SELECT CollectionID FROM collection WHERE CollectionID = ? AND IsDeleted = 0",
    [collectionId]
  );

  if (rows.length === 0) {
    throw makeError(400, "The selected collection does not exist");
  }
}

async function getExhibitions() {
  const [rows] = await pool.query(
    selectExhibitions + " ORDER BY e.StartDate"
  );

  return {
    status: 200,
    data: rows.map(formatExhibition),
  };
}

async function addExhibition(params, body) {
  const exhibition = checkExhibition(body);

  await checkDuplicateName(exhibition.Name);
  await checkCollection(exhibition.CollectionID);

  const [result] = await pool.query(
    `INSERT INTO exhibition
      (Name, Description, StartDate, EndDate, Capacity, CollectionID,
       CreatedAt, UpdatedAt, CreatedBy)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NULL)`,
    [
      exhibition.Name,
      exhibition.Description,
      exhibition.StartDate,
      exhibition.EndDate,
      exhibition.Capacity,
      exhibition.CollectionID,
    ]
  );

  const newExhibition = await findExhibition(result.insertId);

  return {
    status: 201,
    data: newExhibition,
  };
}

async function updateExhibition(params, body) {
  const id = checkId(params);
  const exhibition = checkExhibition(body);

  const existing = await findExhibition(id);

  if (existing === null) {
    throw makeError(404, "Exhibition not found");
  }

  await checkDuplicateName(exhibition.Name, id);

  if (Number(existing.CollectionID) !== exhibition.CollectionID) {
    await checkCollection(exhibition.CollectionID);
  }

  await pool.query(
    `UPDATE exhibition
     SET Name = ?,
         Description = ?,
         StartDate = ?,
         EndDate = ?,
         Capacity = ?,
         CollectionID = ?,
         UpdatedAt = NOW()
     WHERE ExhibitionID = ?
       AND IsDeleted = 0`,
    [
      exhibition.Name,
      exhibition.Description,
      exhibition.StartDate,
      exhibition.EndDate,
      exhibition.Capacity,
      exhibition.CollectionID,
      id,
    ]
  );

  const updatedExhibition = await findExhibition(id);

  return {
    status: 200,
    data: updatedExhibition,
  };
}

async function deleteExhibition(params) {
  const id = checkId(params);

  const existing = await findExhibition(id);

  if (existing === null) {
    throw makeError(404, "Exhibition not found");
  }

  await pool.query(
    `UPDATE exhibition
     SET IsDeleted = 1, UpdatedAt = NOW()
     WHERE ExhibitionID = ? AND IsDeleted = 0`,
    [id]
  );

  return {
    status: 200,
    data: { message: "Exhibition deleted" },
  };
}

module.exports = [
  {
    method: "GET",
    path: "/api/exhibitions",
    handler: getExhibitions,
  },
  {
    method: "POST",
    path: "/api/exhibitions",
    handler: addExhibition,
  },
  {
    method: "PUT",
    path: "/api/exhibitions/:id",
    handler: updateExhibition,
  },
  {
    method: "DELETE",
    path: "/api/exhibitions/:id",
    handler: deleteExhibition,
  },
];
