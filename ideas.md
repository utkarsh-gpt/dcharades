#Games List:

##1. Uno
##2. Blockbuster (Bollywood Edition)

**Blockbuster (Bollywood Edition)**

Design and develop an online team-based movie trivia game app using Next.js and deploy it on Vercel. The game is based on the Blockbuster board game but adapted for Bollywood movies, where two teams compete against each other in head-to-head movie naming challenges.

Game Flow:

1. Two teams join a game session (each team can have multiple players).
2. The game begins when both teams are ready and press the "start" button.
3. A "Head to Head" card is drawn, presenting a specific movie category or topic (e.g., "Movies about sports", "Movies with breakups", "Movies set in school", "Movies with Sanjay Dutt", etc.).
4. One player from each team is selected to go head-to-head for that round.
5. Both players are given a synchronized 45-second timer and a button to press.
6. Players take turns naming movies that fit the given category.
7. Each time a player says a valid movie and presses their button, the timer increases by 2 seconds.
8. The round continues until the timer runs out, and the last player to successfully name a movie wins the round for their team.
9. The winner of the head-to-head round receives 6 movie cards, each displaying a movie title and its major genre.
10. The winning player selects 3 movies they want to play with and gives the remaining 3 cards to the losing player.
11. Each player arranges their 3 selected movies into three fields: "One Word", "Quote It/Dialogue", and "Act It Out".
12. The winning player from the head-to-head goes first and has 1 minute to play their round:
    - They start with the movie in their "One Word" field and give a one-word clue
    - If their teammates guess correctly, they move to the "Quote It/Dialogue" field and recite a dialogue or quote from that movie
    - If guessed correctly again, they proceed to the "Act It Out" field and act out the third movie
    - Players can choose to skip any field if their teammates are unable to guess
13. After the first player's turn, the opposing team's player takes their turn following the same format.
14. If time remains after completing their own 3 movies, players can attempt the opponent's movies, starting with their "One Word" field and progressing through their fields.
15. Skipped movies remain on the board and can be attempted later.
16. The head-to-head and movie rounds cycle continues until every team member has had a turn.
17. Final scoring is based on the number of unique movie genres successfully guessed by each team.

Game Requirements:

1. The game should support team-based gameplay with multiple players per team.
2. A comprehensive database of "Head to Head" cards with various Bollywood movie categories and topics.
3. A synchronized timer system that starts at 45 seconds for head-to-head rounds and increases by 2 seconds with each valid movie submission.
4. Real-time validation of movie names to ensure they fit the given category during head-to-head rounds.
5. A database of Bollywood movie cards with titles and their major genres for the movie guessing rounds.
6. A 1-minute timer system for individual player rounds during the movie guessing phase.
7. Score tracking for teams across multiple rounds based on unique movie genres guessed.
8. Visual and audio cues for timer updates, valid submissions, round endings, and successful guesses.
9. Interface for players to arrange movies into "One Word", "Quote It/Dialogue", and "Act It Out" fields.
10. Skip functionality for movies that teammates cannot guess.

Technical Requirements:

1. The app should be built using Next.js for server-side rendering and static site generation.
2. The app should be deployed on Vercel for fast and secure hosting.
3. The app should use WebSockets for real-time synchronization between teams, timer management, and live gameplay updates.
4. The app should have an intuitive interface for displaying categories, multiple timer states, team scores, player actions, and movie arrangement fields.
5. The app should be mobile friendly to accommodate players using different devices.
6. The app should ensure synchronized gameplay experience for all players across different devices during both head-to-head and movie guessing phases.
7. The app should support real-time movie validation against category databases.
8. The app should handle turn-based gameplay mechanics and player rotation within teams.


##3. Classic Dumb Charades

**Classic Dumb Charades**

Design and develop an online two-person connection game app using Next.js and deploy it on . The game is based on Charades, where two players join a game session.Vercel The game flow is as follows:

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
