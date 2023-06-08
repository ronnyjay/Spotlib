const { getBase64ImageData } = require("../../../util/decode");
const { Buffer } = require("buffer");

module.exports = class Spotify {
  authorizationUrl;
  #clientId;
  #clientSecret;
  #redirectUri;
  #access_token;
  #refresh_token;

  constructor(clientId, clientSecret, redirectUri) {
    this.#clientId = clientId;
    this.#clientSecret = clientSecret;
    this.#redirectUri = redirectUri;

    this.authorizationUrl = `https://accounts.spotify.com/authorize?client_id=${
      this.#clientId
    }&response_type=code&redirect_uri=${
      this.#redirectUri
    }&scope=user-read-private%20user-read-email%20user-library-modify%20playlist-modify-private%20playlist-modify-public%20ugc-image-upload&state=listsorter&show_dialog=true`;
  }

  async authorizationCodeGrant(code) {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer.from(this.#clientId + ":" + this.#clientSecret).toString(
            "base64"
          ),
      },
      body: `grant_type=authorization_code&code=${code}&redirect_uri=${
        this.#redirectUri
      }`,
    });

    const data = await response.json();

    if (response.ok) {
      this.#access_token = data.access_token;
      this.#refresh_token = data.refresh_token;
    } else {
      throw new Error("Failed to obtain access token");
    }
  }

  async #refreshAccessToken() {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer.from(this.#clientId + ":" + this.#clientSecret).toString(
            "base64"
          ),
      },
      body: "grant_type=refresh_token&refresh_token=" + this.#refresh_token,
    });

    const data = await response.json();

    if (response.ok) {
      this.#access_token = data.access_token;
    } else {
      throw new Error("Failed to refresh access token");
    }
  }

  async #get_json(requestUrl) {
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + this.#access_token,
      },
    });

    if (response.status === 401) {
      await this.#refreshAccessToken();
      return await this.#get_json(requestUrl);
    }

    return await response.json();
  }

  async #post_json(requestUrl, body) {
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.#access_token,
        "Content-Type": "application/json",
      },
      body: body,
    });

    if (response.status === 401) {
      await this.#refreshAccessToken();
      return await this.#post_json(requestUrl);
    }

    return await response.json();
  }

  async #put_json(requestUrl, body, content_type) {
    if (content_type === undefined) {
      content_type = "application/json";
    }

    const response = await fetch(requestUrl, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + this.#access_token,
        "Content-Type": content_type,
      },
      body: body,
    });

    if (response.status === 401) {
      await this.#refreshAccessToken();
      return await this.#put_json(requestUrl);
    }
  }

  async #delete_json(requestUrl, body) {
    const response = await fetch(requestUrl, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + this.#access_token,
        "Content-Type": "application/json",
      },
      body: body,
    });

    if (response.status === 401) {
      await this.#refreshAccessToken();
      return await this.#delete_json(requestUrl);
    }

    return await response.json();
  }

  async getCurrentUser() {
    return await this.#get_json("https://api.spotify.com/v1/me");
  }

  async getCurrentUsersPlaylists() {
    let response = await this.#get_json(
      "https://api.spotify.com/v1/me/playlists"
    );
    let items = response.items;

    if (response.next) {
      do {
        response = await this.#get_json(response.next);
        items.concat(response.items);
      } while (response.next);
    }

    const playlists = [];

    for (let item of items) {
      const total = item.tracks.total;

      let image = "https://i.ibb.co/LNYMkHD/default-artwork.png";
      if (item.images[0]?.url) {
        image = item.images[0].url;
      }

      playlists.push({
        name: item.name.toLowerCase(),
        id: item.id,
        image: image,
        total: total,
      });
    }

    return playlists;
  }

  async getPlaylistTracks(playlistId) {
    let response = (
      await this.#get_json("https://api.spotify.com/v1/playlists/" + playlistId)
    ).tracks;

    let tracks = response.items.map((item) => item.track);

    if (response.next) {
      do {
        response = await this.#get_json(response.next);
        if (!response) {
          return this.getPlaylistTracks(playlistId);
        }
        tracks = tracks.concat(response.items.map((item) => item.track));
      } while (response.next);
    }

    const ids = tracks.map((track) => track.id);
    const audio_features = await this.getAudioFeaturesForTracks(ids);

    let i = 0;
    const trackObjects = [];
    for (let track of tracks) {
      trackObjects.push({
        track: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        id: track.id,
        uri: track.uri,
        release_date: track.album.release_date,
        image: track.album.images[0].url,
        danceability: audio_features[i].danceability,
        key: audio_features[i].key,
        mode: audio_features[i].mode,
      });
      i++;
    }

    return trackObjects;
  }

  async getAudioFeaturesForTracks(trackIds) {
    const batchSize = 100;
    const batches = [];

    // Split trackIds into batches of 100
    for (let i = 0; i < trackIds.length; i += batchSize) {
      const batch = trackIds.slice(i, i + batchSize);
      batches.push(batch);
    }

    const audioFeatures = [];

    // Send requests for each batch and collect the audio features
    for (const batch of batches) {
      const endpoint = `https://api.spotify.com/v1/audio-features/?ids=${batch.join(
        ","
      )}`;

      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: "Bearer " + this.#access_token,
          },
        });

        const data = await response.json();

        if (data.audio_features) {
          audioFeatures.push(...data.audio_features);
        } else {
          throw new Error("Unable to retrieve audio features");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }

    return audioFeatures;
  }

  async addTracksToPlaylist(playlistId, trackUris) {
    const body = JSON.stringify({ uris: trackUris });
    await this.#post_json(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      body
    );
  }

  async removeAllPlaylistItems(playlistId, trackUris) {
    const batchSize = 100;

    for (let i = 0; i < trackUris.length; i += batchSize) {
      const batch = trackUris.slice(i, i + batchSize);
      const body = JSON.stringify({ uris: batch });
      await this.#delete_json(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        body
      );
    }
  }

  async updatePlaylistItems(playlistId, trackUris) {
    const batchSize = 100;

    for (let i = 0; i < trackUris.length; i += batchSize) {
      const batch = trackUris.slice(i, i + batchSize);
      const body = JSON.stringify({ uris: batch });
      await this.#put_json(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        body
      );
    }
  }

  async createPlaylist(playlist) {
    const currentUserId = (await this.getCurrentUser()).id;
    const body = JSON.stringify({
      name: "Copy of " + playlist.name,
    });
    const data = await this.#post_json(
      `https://api.spotify.com/v1/users/${currentUserId}/playlists`,
      body
    );
    await this.addCustomPlaylistCoverImage(data.id, playlist.image);

    return data;
  }

  async addCustomPlaylistCoverImage(playlistId, imageUrl) {
    const body = await getBase64ImageData(imageUrl);
    await this.#put_json(
      `https://api.spotify.com/v1/playlists/${playlistId}/images`,
      body,
      "image/jpeg"
    );
  }
};
