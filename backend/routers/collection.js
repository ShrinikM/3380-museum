const pool = require("../db");

const selectCollections = `
  SELECT
    collection.CollectionID,
    collection.Name,
    collection.Description,
    collection.CreatedAt,
    collection.UpdatedAt,
    collection.CreatedBy,
    collection.UpdatedBy,
    CONCAT(creator.FirstName, ' ', creator.LastName) AS CreatedByName,
    CONCAT(updater.FirstName, ' ', updater.LastName) AS UpdatedByName,
    (SELECT COUNT(*) FROM artwork
      WHERE artwork.CollectionID = collection.CollectionID AND artwork.IsDeleted = 0) AS ArtworkCount
  FROM collection
  LEFT JOIN staff AS creator ON creator.StaffID = collection.CreatedBy
  LEFT JOIN staff AS updater ON updater.StaffID = collection.UpdatedBy
  WHERE collection.IsDeleted = 0`;

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

function checkCollection(body) {
  const collection = {};

  collection.Name = checkText(body.Name, "Name");
  collection.Description = checkText(body.Description, "Description");

  return collection;
}

function checkId(params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw makeError(400, "Collection id must be a whole number greater than 0");
  }
  return id;
}

async function findCollection(id) {
  const [rows] = await pool.query(selectCollections + " AND collection.CollectionID = ?", [id]);
  if (rows.length === 0) {
    return null;
  }
  return rows[0];
}

async function getCollections(params, body, staffId) {
  const [rows] = await pool.query(selectCollections + " ORDER BY collection.Name");
  return { status: 200, data: rows };
}

async function addCollection(params, body, staffId) {
  const collection = checkCollection(body);

  const [result] = await pool.query(
    `INSERT INTO collection
      (Name, Description, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy)
     VALUES (?, ?, NOW(), NOW(), ?, ?)`,
    [collection.Name, collection.Description, staffId, staffId]
  );

  const newCollection = await findCollection(result.insertId);
  return { status: 201, data: newCollection };
}

async function updateCollection(params, body, staffId) {
  const id = checkId(params);
  const collection = checkCollection(body);

  const existingCollection = await findCollection(id);
  if (existingCollection === null) {
    throw makeError(404, "Collection not found");
  }

  await pool.query(
    `UPDATE collection
     SET Name = ?, Description = ?, UpdatedAt = NOW(), UpdatedBy = ?
     WHERE CollectionID = ?`,
    [collection.Name, collection.Description, staffId, id]
  );

  const updatedCollection = await findCollection(id);
  return { status: 200, data: updatedCollection };
}

async function deleteCollection(params, body, staffId) {
  const id = checkId(params);

  const existingCollection = await findCollection(id);
  if (existingCollection === null) {
    throw makeError(404, "Collection not found");
  }

  if (existingCollection.ArtworkCount > 0) {
    throw makeError(409, "This collection still has artworks, so it cannot be deleted");
  }

  await pool.query(
    "UPDATE collection SET IsDeleted = 1, UpdatedAt = NOW(), UpdatedBy = ? WHERE CollectionID = ?",
    [staffId, id]
  );

  return { status: 200, data: { message: "Collection deleted" } };
}

module.exports = [
  { method: "GET", path: "/api/collections", handler: getCollections },
  { method: "POST", path: "/api/collections", handler: addCollection, needsActor: true },
  { method: "PUT", path: "/api/collections/:id", handler: updateCollection, needsActor: true },
  { method: "DELETE", path: "/api/collections/:id", handler: deleteCollection, needsActor: true },
];
