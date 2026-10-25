const pool = require("../db");

const selectArtworks = `
  SELECT
    artwork.ArtworkID,
    artwork.Title,
    artwork.Type,
    artwork.YearCreated,
    artwork.ArtistID,
    CONCAT(artist.FirstName, ' ', artist.LastName) AS ArtistName,
    artwork.CollectionID,
    collection.Name AS CollectionName,
    artwork.CreatedAt,
    artwork.UpdatedAt,
    artwork.CreatedBy,
    artwork.UpdatedBy,
    CONCAT(creator.FirstName, ' ', creator.LastName) AS CreatedByName,
    CONCAT(updater.FirstName, ' ', updater.LastName) AS UpdatedByName
  FROM artwork
  JOIN artist ON artist.ArtistID = artwork.ArtistID
  JOIN collection ON collection.CollectionID = artwork.CollectionID
  LEFT JOIN staff AS creator ON creator.StaffID = artwork.CreatedBy
  LEFT JOIN staff AS updater ON updater.StaffID = artwork.UpdatedBy
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

function checkYear(value, fieldName) {
  if (!Number.isInteger(value)) {
    throw makeError(400, fieldName + " must be a whole year like 1900");
  }

  if (value > new Date().getFullYear()) {
    throw makeError(400, fieldName + " cannot be in the future");
  }
  if (value < 1000) {
    throw makeError(400, fieldName + " cannot be before 1000");
  }

  return value;
}

function checkWholeNumber(value, fieldName) {
  if (!Number.isInteger(value) || value < 1) {
    throw makeError(400, fieldName + " must be a whole number greater than 0");
  }
  return value;
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

  if (body.YearCreated === undefined || body.YearCreated === null || body.YearCreated === "") {
    throw makeError(400, "YearCreated is required");
  }
  artwork.YearCreated = checkYear(body.YearCreated, "YearCreated");

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

async function addArtwork(params, body, staffId) {
  const artwork = await checkArtwork(body);

  const [result] = await pool.query(
    `INSERT INTO artwork
      (Title, Type, YearCreated, ArtistID, CollectionID, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)`,
    [
      artwork.Title,
      artwork.Type,
      artwork.YearCreated,
      artwork.ArtistID,
      artwork.CollectionID,
      staffId,
      staffId,
    ]
  );

  const newArtwork = await findArtwork(result.insertId);
  return { status: 201, data: newArtwork };
}

async function updateArtwork(params, body, staffId) {
  const id = checkId(params);
  const artwork = await checkArtwork(body);

  const existingArtwork = await findArtwork(id);
  if (existingArtwork === null) {
    throw makeError(404, "Artwork not found");
  }

  await pool.query(
    `UPDATE artwork
     SET Title = ?, Type = ?, YearCreated = ?, ArtistID = ?, CollectionID = ?, UpdatedAt = NOW(), UpdatedBy = ?
     WHERE ArtworkID = ?`,
    [artwork.Title, artwork.Type, artwork.YearCreated, artwork.ArtistID, artwork.CollectionID, staffId, id]
  );

  const updatedArtwork = await findArtwork(id);
  return { status: 200, data: updatedArtwork };
}

async function deleteArtwork(params, body, staffId) {
  const id = checkId(params);

  const existingArtwork = await findArtwork(id);
  if (existingArtwork === null) {
    throw makeError(404, "Artwork not found");
  }

  await pool.query(
    "UPDATE artwork SET IsDeleted = 1, UpdatedAt = NOW(), UpdatedBy = ? WHERE ArtworkID = ?",
    [staffId, id]
  );

  return { status: 200, data: { message: "Artwork deleted" } };
}

module.exports = [
  { method: "GET", path: "/api/artworks", handler: getArtworks },
  { method: "POST", path: "/api/artworks", handler: addArtwork, needsActor: true },
  { method: "PUT", path: "/api/artworks/:id", handler: updateArtwork, needsActor: true },
  { method: "DELETE", path: "/api/artworks/:id", handler: deleteArtwork, needsActor: true },
];
