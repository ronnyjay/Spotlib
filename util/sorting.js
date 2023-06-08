module.exports = {
  sortByArtist(tracks, order) {
    if (order === "asc") {
      tracks.sort((a, b) => {
        if (a.artist > b.artist) return 1;
        if (a.artist < b.artist) return -1;

        if (a.album > b.album) return 1;
        if (a.album < b.album) return -1;

        if (a.track > b.track) return 1;
        if (a.track < b.track) return -1;

        if (a.release_date > b.release_date) return 1;
        if (a.release_date < b.release_date) return -1;

        return 0;
      });
    } else if (order === "desc") {
      tracks.sort((a, b) => {
        if (a.artist < b.artist) return 1;
        if (a.artist > b.artist) return -1;

        if (a.album < b.album) return 1;
        if (a.album > b.album) return -1;

        if (a.track < b.track) return 1;
        if (a.track > b.track) return -1;

        if (a.release_date > b.release_date) return 1;
        if (a.release_date > b.release_date) return -1;

        return 0;
      });
    }
    return tracks;
  },
  sortByTitle(tracks, order) {
    if (order === "asc") {
      tracks.sort((a, b) => {
        if (a.track > b.track) return 1;
        if (a.track < b.track) return -1;

        if (a.album > b.album) return 1;
        if (a.album < b.album) return -1;

        if (a.artist > b.artist) return 1;
        if (a.artist < b.artist) return -1;

        if (a.release_date > b.release_date) return 1;
        if (a.release_date < b.release_date) return -1;

        return 0;
      });
    } else if (order === "desc") {
      tracks.sort((a, b) => {
        if (a.track < b.track) return 1;
        if (a.track > b.track) return -1;

        if (a.album < b.album) return 1;
        if (a.album > b.album) return -1;

        if (a.artist < b.artist) return 1;
        if (a.artist > b.artist) return -1;

        if (a.release_date < b.release_date) return 1;
        if (a.release_date > b.release_date) return -1;

        return 0;
      });
    }
    return tracks;
  },
  sortByAlbum(tracks, order) {
    if (order === "asc") {
      tracks.sort((a, b) => {
        if (a.album > b.album) return 1;
        if (a.album < b.album) return -1;

        return 0;
      });
    } else if (order === "desc") {
      tracks.sort((a, b) => {
        if (a.album < b.album) return 1;
        if (a.album > b.album) return -1;

        return 0;
      });
    }
    return tracks;
  },
  sortByDanceability(tracks, order) {
    if (order === "asc") {
      tracks.sort((a, b) => {
        if (a.danceability > b.danceability) return 1;
        if (a.danceability < b.danceability) return -1;

        return 0;
      });
    } else if (order === "desc") {
      tracks.sort((a, b) => {
        if (a.danceability < b.danceability) return 1;
        if (a.danceability > b.danceability) return -1;

        return 0;
      });
    }
    return tracks;
  },
  sortByKey(tracks, order) {
    if (order === "asc") {
      tracks.sort((a, b) => {
        if (a.key > b.key) return 1;
        if (a.key < b.key) return -1;
        return 0;
      });
    } else if (order === "desc") {
      tracks.sort((a, b) => {
        if (a.key < b.key) return 1;
        if (a.key > b.key) return -1;
        return 0;
      });
    }
    return tracks;
  }
};
