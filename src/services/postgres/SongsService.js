const { Pool } = require('pg'); // ? Postgres Pool
const { nanoid } = require('nanoid'); // ? Unique string ID generator
const { mapDBToModel } = require('../../utils'); // ? Mapping DB Data to Songs Object

// ? Exceptions Types
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [
        id,
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE ($1::text IS NULL OR title ILIKE $1) AND ($2::text IS NULL OR performer ILIKE $2)',
      values: [
        title ? `%${title}%` : null,
        performer ? `%${performer}%` : null,
      ],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async editSongById(
    id,
    { title, year, genre, performer, duration, albumId },
  ) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
        id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        'Gagal memperbarui lagu. Id tidak ditemukan',
      );
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        'Lagu gagal dihapus. Id tidak ditemukan',
      );
    }
  }
}

module.exports = SongsService;
