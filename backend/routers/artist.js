const pool = require("../db");

const selectArtists = `
  SELECT
    artist.ArtistID,
    artist.FirstName,
    artist.LastName,
    artist.Nationality,
    artist.BirthYear,
    artist.DeathYear,
    artist.CreatedAt,
    artist.UpdatedAt,
    artist.CreatedBy,
    artist.UpdatedBy,
    CONCAT(creator.FirstName, ' ', creator.LastName) AS CreatedByName,
    CONCAT(updater.FirstName, ' ', updater.LastName) AS UpdatedByName,
    (SELECT COUNT(*) FROM artwork
      WHERE artwork.ArtistID = artist.ArtistID AND artwork.IsDeleted = 0) AS ArtworkCount
  FROM artist
  LEFT JOIN staff AS creator ON creator.StaffID = artist.CreatedBy
  LEFT JOIN staff AS updater ON updater.StaffID = artist.UpdatedBy
  WHERE artist.IsDeleted = 0`;

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
  const year = Number(value);
  const currentYear = new Date().getFullYear();

  if (
    value === undefined ||
    value === null ||
    value === "" ||
    !Number.isInteger(year) ||
    year < 1 ||
    year > currentYear
  ) {
    throw makeError(
      400,
      fieldName + " must be a valid year between 1 and " + currentYear
    );
  }

  return year;
}

function checkArtist(body) {
  const artist = {};

  artist.FirstName = checkText(body.FirstName, "FirstName");
  artist.LastName = checkText(body.LastName, "LastName");
  artist.Nationality = checkText(body.Nationality, "Nationality");

  artist.BirthYear = checkYear(body.BirthYear, "BirthYear");

  artist.DeathYear = null;

  if (
    body.DeathYear !== undefined &&
    body.DeathYear !== null &&
    body.DeathYear !== ""
  ) {
    artist.DeathYear = checkYear(body.DeathYear, "DeathYear");

    if (artist.DeathYear < artist.BirthYear) {
      throw makeError(400, "DeathYear cannot be before BirthYear");
    }
  }

  return artist;
}

function checkId(params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw makeError(400, "Artist id must be a whole number greater than 0");
  }
  return id;
}

async function findArtist(id) {
  const [rows] = await pool.query(selectArtists + " AND artist.ArtistID = ?", [id]);
  if (rows.length === 0) {
    return null;
  }
  return rows[0];
}

async function getArtists(params, body, staffId) {
  const [rows] = await pool.query(selectArtists + " ORDER BY artist.LastName");
  return { status: 200, data: rows };
}

async function addArtist(params, body, staffId) {
  const artist = checkArtist(body);

  const [result] = await pool.query(
    `INSERT INTO artist
      (FirstName, LastName, BirthYear, DeathYear, Nationality, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)`,
    [
      artist.FirstName,
      artist.LastName,
      artist.BirthYear,
      artist.DeathYear,
      artist.Nationality,
      staffId,
      staffId,
    ]
  );

  const newArtist = await findArtist(result.insertId);
  return { status: 201, data: newArtist };
}

async function updateArtist(params, body, staffId) {
  const id = checkId(params);
  const artist = checkArtist(body);

  const existingArtist = await findArtist(id);
  if (existingArtist === null) {
    throw makeError(404, "Artist not found");
  }

  await pool.query(
    `UPDATE artist
     SET FirstName = ?, LastName = ?, BirthYear = ?, DeathYear = ?, Nationality = ?, UpdatedAt = NOW(), UpdatedBy = ?
     WHERE ArtistID = ?`,
    [artist.FirstName, artist.LastName, artist.BirthYear, artist.DeathYear, artist.Nationality, staffId, id]
  );

  const updatedArtist = await findArtist(id);
  return { status: 200, data: updatedArtist };
}

async function deleteArtist(params, body, staffId) {
  const id = checkId(params);

  const existingArtist = await findArtist(id);
  if (existingArtist === null) {
    throw makeError(404, "Artist not found");
  }

  if (existingArtist.ArtworkCount > 0) {
    throw makeError(409, "This artist still has artworks, so they cannot be deleted");
  }

  await pool.query(
    "UPDATE artist SET IsDeleted = 1, UpdatedAt = NOW(), UpdatedBy = ? WHERE ArtistID = ?",
    [staffId, id]
  );

  return { status: 200, data: { message: "Artist deleted" } };
}

module.exports = [
  { method: "GET", path: "/api/artists", handler: getArtists },
  { method: "POST", path: "/api/artists", handler: addArtist, needsActor: true },
  { method: "PUT", path: "/api/artists/:id", handler: updateArtist, needsActor: true },
  { method: "DELETE", path: "/api/artists/:id", handler: deleteArtist, needsActor: true },
];
