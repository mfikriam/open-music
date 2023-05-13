const { Pool } = require('pg'); // ? Postgres Pool
const { nanoid } = require('nanoid'); // ? Unique string ID generator
// const { mapDBToModel } = require('../../utils'); // ? Mapping DB Data to Songs Object

// ? Exceptions Types
const InvariantError = require('../../exceptions/InvariantError');
// const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query('SELECT * FROM songs');
    console.log(
      result.rows.map(({ id, title, performer }) => ({ id, title, performer })),
    );
    return result.rows.map(({ id, title, performer }) => ({
      id,
      title,
      performer,
    }));
  }
}

module.exports = SongsService;
