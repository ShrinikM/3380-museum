const pool = require("../db");

const selectArtists = `
  SELECT
    ArtistID,
    FirstName,
    LastName,
    Nationality,
    DATE_FORMAT(BirthYear, '%Y-%m-%d') AS BirthYear,
    DATE_FORMAT(DeathYear, '%Y-%m-%d') AS DeathYear,
    CreatedAt,
    UpdatedAt,
    CreatedBy,
    (SELECT COUNT(*) FROM artwork
      WHERE artwork.ArtistID = artist.ArtistID AND artwork.IsDeleted = 0) AS ArtworkCount
  FROM artist
  WHERE IsDeleted = 0`;

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

function checkArtist(body) {
  const artist = {};

  artist.FirstName = checkText(body.FirstName, "FirstName");
  artist.LastName = checkText(body.LastName, "LastName");
  artist.Nationality = checkText(body.Nationality, "Nationality");

  if (body.BirthYear === undefined || body.BirthYear === null || body.BirthYear === "") {
    throw makeError(400, "BirthYear is required");
  }
  artist.BirthYear = checkDate(body.BirthYear, "BirthYear");

  artist.DeathYear = null;
  if (body.DeathYear !== undefined && body.DeathYear !== null && body.DeathYear !== "") {
    artist.DeathYear = checkDate(body.DeathYear, "DeathYear");
    if (artist.DeathYear < artist.BirthYear) {
      throw makeError(400, "DeathYear cannot be before BirthYear");
    }
  }

  return artist;
}

function checkCreatedBy(value) {
  if (value === undefined || value === null) {
    return null;
  }
  if (!Number.isInteger(value) || value < 1) {
    throw makeError(400, "CreatedBy must be a whole number greater than 0");
  }
  return value;
}

function checkId(params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw makeError(400, "Artist id must be a whole number greater than 0");
  }
  return id;
}

async function findArtist(id) {
  const [rows] = await pool.query(selectArtists + " AND ArtistID = ?", [id]);
  if (rows.length === 0) {
    return null;
  }
  return rows[0];
}

async function getArtists(params, body) {
  const [rows] = await pool.query(selectArtists + " ORDER BY LastName");
  return { status: 200, data: rows };
}

async function addArtist(params, body) {
  const artist = checkArtist(body);
  const createdBy = checkCreatedBy(body.CreatedBy);

  let result;
  try {
    [result] = await pool.query(
      `INSERT INTO artist
        (FirstName, LastName, BirthYear, DeathYear, Nationality, CreatedAt, UpdatedAt, CreatedBy)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
      [
        artist.FirstName,
        artist.LastName,
        artist.BirthYear,
        artist.DeathYear,
        artist.Nationality,
        createdBy,
      ]
    );
  } catch (error) {
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      throw makeError(400, "CreatedBy does not match any staff member");
    }
    throw error;
  }

  const newArtist = await findArtist(result.insertId);
  return { status: 201, data: newArtist };
}

async function updateArtist(params, body) {
  const id = checkId(params);
  const artist = checkArtist(body);

  const existingArtist = await findArtist(id);
  if (existingArtist === null) {
    throw makeError(404, "Artist not found");
  }

  await pool.query(
    `UPDATE artist
     SET FirstName = ?, LastName = ?, BirthYear = ?, DeathYear = ?, Nationality = ?, UpdatedAt = NOW()
     WHERE ArtistID = ?`,
    [artist.FirstName, artist.LastName, artist.BirthYear, artist.DeathYear, artist.Nationality, id]
  );

  const updatedArtist = await findArtist(id);
  return { status: 200, data: updatedArtist };
}

async function deleteArtist(params, body) {
  const id = checkId(params);

  const existingArtist = await findArtist(id);
  if (existingArtist === null) {
    throw makeError(404, "Artist not found");
  }

  if (existingArtist.ArtworkCount > 0) {
    throw makeError(409, "This artist still has artworks, so they cannot be deleted");
  }

  await pool.query("UPDATE artist SET IsDeleted = 1, UpdatedAt = NOW() WHERE ArtistID = ?", [id]);

  return { status: 200, data: { message: "Artist deleted" } };
}

module.exports = [
  { method: "GET", path: "/api/artists", handler: getArtists },
  { method: "POST", path: "/api/artists", handler: addArtist },
  { method: "PUT", path: "/api/artists/:id", handler: updateArtist },
  { method: "DELETE", path: "/api/artists/:id", handler: deleteArtist },
];
