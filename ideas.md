Design and develop an online two-person connection game app using Next.js and deploy it on Vercel. The game is based on Charades, where two players join a game session. The game flow is as follows:

1. Two players join a game session.
2. The game begins when both players press the "play" button.
3. One player is randomly selected to act out a movie title, and a timer starts counting down.
4. The other player attempts to guess the movie title within the time limit.
5. If the guessing player correctly identifies the movie, the acting player can press the "guessed" button to end the round.
6. The roles are reversed for the next round, and the process repeats for a predetermined number of rounds.

Game Requirements:

1. The user hosting the game should be able to configure the game settings before starting the game. These settings include:
    - Number of rounds: The game should last for a maximum of 10 rounds.
    - Guessing time: The time limit for guessing the movie title should be selectable from the following options: 3 minutes, 5 minutes, 10 minutes, or unlimited.
2. The game requires a list of movie titles from both Hollywood and Bollywood to act out.
3. A display timer is necessary to show the remaining time for guessing.

Technical Requirements:

1. The app should be built using Next.js for server-side rendering and static site generation.
2. The app should be deployed on Vercel for fast and secure hosting.
3. The app should use WebSockets or WebRTC for real-time communication between the two players.
4. The app should have a user-friendly interface for selecting game settings, displaying the timer, and facilitating the gameplay.
5. The app should ensure a smooth and lag-free experience for both players during the game session.
