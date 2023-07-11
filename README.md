# KaraokeApp

KaraokeApp is a karaoke room management app built with React and TypeScript. It relies on Firebase for its Firestore database, hosting, and authentication.

With KaraokeApp, admins can create karaoke rooms with unique IDs that they can share with users. Users can access the karaoke room using the code and search for and queue up songs they want to sing. To queue up a song, users must enter their table number and the name of the person or people who will be singing the song.

Admins can manage the rooms they create and see songs being queued up. They can organize the songs in the queue manually, by request time, or by alternating between tables. Admins can also view recently sung songs or songs deleted from the queue. Additionally, admins can add songs to the queue by providing the same information as a user.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- npm or yarn
- Firebase account

### Installing

1. Clone the repository
2. Install dependencies with `npm install` or `yarn install`
3. Set up your Firebase configuration by following the instructions [here](https://firebase.google.com/docs/web/setup)
4. Start the development server with `npm start` or `yarn start`

## Deployment

Follow the instructions [here](https://firebase.google.com/docs/hosting/deploying) to deploy your app to Firebase Hosting.

Before deploying, make sure to set up your Firestore database collections as follows: The manager must create a collection for every songs list that they want to be able to present to the users. There should be a "users" collection where the documents have an ID of "admin email" and fields such as "active room" (a string or array of strings that keeps track of an admin's active rooms by roomId), "created_rooms" (the total number of rooms an admin has created using the app), "email" (the admin's email), "name" (the display name for the admin), "permissions" (either "active" or "inactive", indicating whether the admin can create more rooms or not), and "songs_db" (the name of the collection that has the songs that are available to queue up).

## Built With

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript that compiles to plain JavaScript
- [Firebase](https://firebase.google.com/) - A platform developed by Google for creating mobile and web applications

## License

This project is open source. If you use it, please provide credit.
