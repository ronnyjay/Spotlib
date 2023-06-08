
# Spotlib - Spotify Library Manager 

Spotlib is a my first attempt at making an electron app that serves some use for myself and hopefully others. Although there are various websites that already provide this service, I wanted to use this project as a learning experience in order to gain some insight into front-end web development. As there is still much more to be added and experimented with, I plan on updating this quite frequently.

## Features
- Sort by *track, artist, album, danceability, and key*.
- Playlists can be sorted in either *Ascending* or *Descending* order.
- When sorting a playlist, users have the option to choose between *Cloning* or *Modifying* their current playlist.
- Just for fun, I added themes.

*In the future I would like to add more methods of sorting including but not limited to acousticness, duration, energy, instrumentalness, liveness, loudness, mode, and tempo. A signed installer would be nice as well.*

## Installation/Usage
- Clone this repository
- Install any necessary dependencies with 'npm install'
- Register an app through "https://developer.spotify.com/" and obtain your *Client Id*, *Client Secret*, and *Redirect Uri*.
- Create a .env file in the root directory of the app and format your spotify credentials like so:

    ![.env](https://i.ibb.co/c29Jb8M/img.png)


- Spotlib can then be started with 'npm start'


*Spotlib is specifically written for Windows/Linux systems, and although it will work on macOS out of the box, it is recommended to look through the comments located in the directory "./render/components/windows/Window.js".*

