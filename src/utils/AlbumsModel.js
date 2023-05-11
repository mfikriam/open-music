const mapDBToAlbumsModel = ({ album_id, name, year }) => ({
  albumId: album_id,
  name,
  year,
});

module.exports = { mapDBToAlbumsModel };
