#Games List:

##1. Uno (2-Player Edition with Unique Cards)

**Uno (2-Player Edition with Unique Cards)**

Design and develop an online Uno card game optimized for 2-player gameplay using Next.js and deploy it on Vercel. This version includes traditional Uno cards plus unique cards specifically designed to enhance the strategic depth and excitement of head-to-head matches.

Game Flow:

1. Two players join a game session and are dealt 7 cards each.
2. The remaining cards form a draw pile, with the top card placed face-up to start the discard pile.
3. Players take turns matching the top card by color, number, or symbol.
4. Special action cards and unique 2-player cards add strategic elements to gameplay.
5. Players must call "Uno" when they have one card remaining.
6. First player to empty their hand wins the round and scores points based on opponent's remaining cards.
7. Games can be played to a target score (e.g., 500 points) or as individual rounds.

Unique 2-Player Cards:

1. **Duel Card** - Both players simultaneously reveal their next card. Higher number wins and gets to play again. If tied, both draw 2 cards.
2. **Mirror Card** - Forces opponent to draw the same number of cards you currently have in your hand.
3. **Swap Hands** - Exchange your entire hand with your opponent's hand.
4. **Peek & Pick** - Look at opponent's hand and force them to discard a card of your choice.
5. **Double Down** - Play two cards of the same number/color simultaneously, opponent draws 4 cards.
6. **Revenge Card** - Can only be played after opponent uses an action card against you. Doubles the effect back to them.
7. **Shield Card** - Blocks the next action card played against you and reflects it back to opponent.
8. **Time Bomb** - Opponent must play a card within 10 seconds or draw 3 cards.
9. **Lucky Draw** - Draw 3 cards, keep one, opponent draws the other 2.
10. **Final Stand** - Can only be played when you have 3 or fewer cards. Opponent draws cards equal to your hand size.

Traditional Uno Cards:
- Number cards (0-9) in four colors (Red, Blue, Green, Yellow)
- Skip cards (opponent loses their turn)
- Reverse cards (changes direction - acts as Skip in 2-player)
- Draw Two cards
- Wild cards (choose color)
- Wild Draw Four cards

Game Requirements:

1. Real-time multiplayer support for 2 players with WebSocket connections.
2. Card validation system to ensure legal plays according to Uno rules.
3. Timer system for turn management and special card effects.
4. Visual card animations for drawing, playing, and special effects.
5. Score tracking across multiple rounds with point calculation.
6. "Uno" call detection and penalty system for forgetting to call.
7. Chat system for player communication and trash talk.
8. Spectator mode for watching ongoing games.
9. Ranking system based on wins/losses and performance.
10. Sound effects and visual feedback for card plays and special events.

Technical Requirements:

1. Built using Next.js with TypeScript for type safety and better development experience.
2. Real-time gameplay using Socket.io for WebSocket connections.
3. Card game logic with proper shuffling, dealing, and validation systems.
4. Responsive design optimized for both desktop and mobile play.
5. State management for game state, player hands, and turn management.
6. Animation library (Framer Motion) for smooth card transitions and effects.
7. Deployed on Vercel with serverless functions for game logic.



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

##4. Bollywood Song Guessing Game

**Bollywood Melody Master**

Design and develop a two-player online game where players compete to guess Bollywood songs from audio clips, lyrics, or humming. The game celebrates Indian music culture with multiple rounds of musical challenges.

Game Flow:
1. Two players join a game session and select difficulty level (90s classics, 2000s hits, recent chartbusters, or mixed).
2. Players take turns being the "performer" and "guesser" across different challenge types.
3. Challenge types include: Audio Clip (5-10 second song snippets), Lyric Lines (display 2-3 lines of lyrics), Humming Round (player hums the tune), and Instrumental Only (music without vocals).
4. Each correct guess earns points, with bonus points for guessing within the first 10 seconds.
5. Special "Antakshari Round" where players must name a song starting with the last letter of the previous song.

Game Requirements:
1. Database of popular Bollywood songs across different eras with audio clips, lyrics, and metadata.
2. Real-time audio streaming capabilities for song clips and player humming.
3. Timer system with 30-60 second rounds depending on challenge type.
4. Scoring system with multipliers for quick guesses and difficulty bonuses.
5. Voice recording functionality for humming rounds.


##5. Indian Celebrity Connections

**Filmi Rishta**

A connection-based game where players link Bollywood celebrities, movies, and industry relationships. Players compete to create the longest chains of connections within time limits.

Game Flow:
1. Players start with a random celebrity name and must create connection chains.
2. Valid connections include: co-starred in movies, family relationships, director-actor collaborations, or production house associations.
3. "Six Degrees" challenge to connect two seemingly unrelated celebrities.
4. "Family Tree" rounds focusing on Bollywood dynasties and relationships.
5. Bonus points for lesser-known but valid connections.

Game Requirements:
1. Comprehensive database of Bollywood relationships and collaborations.
2. Real-time validation of connection claims with supporting evidence.
3. Visual network display showing connection chains.
4. Timer-based rounds with increasing complexity.
5. Hint system for stuck players with point penalties.


## 6. 1 second movie guess Bollywood.