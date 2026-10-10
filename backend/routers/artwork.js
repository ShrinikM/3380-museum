const pool = require("../db");

const selectArtworks = `
  SELECT
    artwork.ArtworkID,
    artwork.Title,
    artwork.Type,
    DATE_FORMAT(artwork.DateCreated, '%Y-%m-%d') AS DateCreated,
    artwork.ArtistID,
    CONCAT(artist.FirstName, ' ', artist.LastName) AS ArtistName,
    artwork.CollectionID,
    collection.Name AS CollectionName,
    artwork.CreatedAt,
    artwork.UpdatedAt,
    artwork.CreatedBy
  FROM artwork
  JOIN artist ON artist.ArtistID = artwork.ArtistID
  JOIN collection ON collection.CollectionID = artwork.CollectionID
  WHERE artwork.IsDeleted = 0`;

function makeError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function checkText(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw makeError(400, fieldName + " is required");
  }
  if (value.trim().length > 255) {
    throw makeError(400, fieldName + " must be 255 characters or fewer");
  }
  return value.trim();
}

function checkDate(value, fieldName) {
  if (typeof value !== "string") {
    throw makeError(400, fieldName + " must be a date like 1900-01-31");
  }

  const date = new Date(value);
  if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw makeError(400, fieldName + " must be a real date like 1900-01-31");
  }

  const today = new Date().toISOString().slice(0, 10);
  if (value > today) {
    throw makeError(400, fieldName + " cannot be in the future");
  }
  if (value < "1000-01-01") {
    throw makeError(400, fieldName + " cannot be before 1000-01-01");
  }

  return value;
}

function checkWholeNumber(value, fieldName) {
  if (!Number.isInteger(value) || value < 1) {
    throw makeError(400, fieldName + " must be a whole number greater than 0");
  }
  return value;
}

function checkCreatedBy(value) {
  if (value === undefined || value === null) {
    return null;
  }
  return checkWholeNumber(value, "CreatedBy");
}

function checkId(params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw makeError(400, "Artwork id must be a whole number greater than 0");
  }
  return id;
}

async function checkArtwork(body) {
  const artwork = {};

  artwork.Title = checkText(body.Title, "Title");
  artwork.Type = checkText(body.Type, "Type");

  if (body.DateCreated === undefined || body.DateCreated === null || body.DateCreated === "") {
    throw makeError(400, "DateCreated is required");
  }
  artwork.DateCreated = checkDate(body.DateCreated, "DateCreated");

  artwork.ArtistID = checkWholeNumber(body.ArtistID, "ArtistID");
  const [artists] = await pool.query(
    "SELECT ArtistID FROM artist WHERE ArtistID = ? AND IsDeleted = 0",
    [artwork.ArtistID]
  );
  if (artists.length === 0) {
    throw makeError(400, "ArtistID does not match any artist");
  }

  artwork.CollectionID = checkWholeNumber(body.CollectionID, "CollectionID");
  const [collections] = await pool.query(
    "SELECT CollectionID FROM collection WHERE CollectionID = ? AND IsDeleted = 0",
    [artwork.CollectionID]
  );
  if (collections.length === 0) {
    throw makeError(400, "CollectionID does not match any collection");
  }

  return artwork;
}

async function findArtwork(id) {
  const [rows] = await pool.query(selectArtworks + " AND artwork.ArtworkID = ?", [id]);
  if (rows.length === 0) {
    return null;
  }
  return rows[0];
}

async function getArtworks() {
  const [rows] = await pool.query(selectArtworks + " ORDER BY artwork.Title");
  return { status: 200, data: rows };
}

async function addArtwork(params, body) {
  const artwork = await checkArtwork(body);
  const createdBy = checkCreatedBy(body.CreatedBy);

  let result;
  try {
    [result] = await pool.query(
      `INSERT INTO artwork
        (Title, Type, DateCreated, ArtistID, CollectionID, CreatedAt, UpdatedAt, CreatedBy)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
      [
        artwork.Title,
        artwork.Type,
        artwork.DateCreated,
        artwork.ArtistID,
        artwork.CollectionID,
        createdBy,
      ]
    );
  } catch (error) {
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      throw makeError(400, "CreatedBy does not match any staff member");
    }
    throw error;
  }

  const newArtwork = await findArtwork(result.insertId);
  return { status: 201, data: newArtwork };
}

async function updateArtwork(params, body) {
  const id = checkId(params);
  const artwork = await checkArtwork(body);

  const existingArtwork = await findArtwork(id);
  if (existingArtwork === null) {
    throw makeError(404, "Artwork not found");
  }

  await pool.query(
    `UPDATE artwork
     SET Title = ?, Type = ?, DateCreated = ?, ArtistID = ?, CollectionID = ?, UpdatedAt = NOW()
     WHERE ArtworkID = ?`,
    [artwork.Title, artwork.Type, artwork.DateCreated, artwork.ArtistID, artwork.CollectionID, id]
  );

  const updatedArtwork = await findArtwork(id);
  return { status: 200, data: updatedArtwork };
}

async function deleteArtwork(params) {
  const id = checkId(params);

  const existingArtwork = await findArtwork(id);
  if (existingArtwork === null) {
    throw makeError(404, "Artwork not found");
  }

  await pool.query("UPDATE artwork SET IsDeleted = 1, UpdatedAt = NOW() WHERE ArtworkID = ?", [id]);

  return { status: 200, data: { message: "Artwork deleted" } };
}

module.exports = [
  { method: "GET", path: "/api/artworks", handler: getArtworks },
  { method: "POST", path: "/api/artworks", handler: addArtwork },
  { method: "PUT", path: "/api/artworks/:id", handler: updateArtwork },
  { method: "DELETE", path: "/api/artworks/:id", handler: deleteArtwork },
];
