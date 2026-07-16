import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const data = JSON.parse(
  readFileSync(fileURLToPath(new URL("../src/data/theatres.json", import.meta.url)))
);

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS theatres (
    id            INTEGER PRIMARY KEY,
    sno           INTEGER,
    district      TEXT,
    centre        TEXT,
    theatre       TEXT,
    format        TEXT,
    type          TEXT,
    screen_count  INTEGER,
    capacity      INTEGER,
    hfc_total     BIGINT,
    screens       JSONB
  );
`);

await client.query("TRUNCATE theatres;");

let n = 0;
for (const t of data) {
  await client.query(
    `INSERT INTO theatres
       (id, sno, district, centre, theatre, format, type, screen_count, capacity, hfc_total, screens)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      t.id,
      t.sno,
      t.district,
      t.centre,
      t.theatre,
      t.format,
      t.type,
      t.screen_count,
      t.capacity,
      t.hfc_total,
      JSON.stringify(t.screens),
    ]
  );
  n++;
}

const { rows } = await client.query("SELECT count(*)::int AS c FROM theatres;");
console.log(`Seeded ${n} theatres. Table now has ${rows[0].c} rows.`);

await client.end();
