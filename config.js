/**
 * Game configuration: all user-facing text and content data.
 */
window.CONFIG = {
  // Page & overlay
  title: 'the side quest',
  overlayTitle: 'THE SIDE QUEST',
  subtitle: 'fight your way to the prince',
  startButton: 'START GAME',
  controls: [
    { keys: 'wasd / arrow keys', action: 'move' },
    { keys: 'space / left click', action: 'melee attack' },
    { keys: 'e / right click', action: 'boom attack' },
    { keys: 'esc', action: 'pause the game' }
  ],

  // HUD
  hud: {
    health: 'health',
    loveMeter: 'lovemeter',
    ammo: 'ammo',
    ammoFormat: 'BOOOM: %d',
    wantedStar: '♥',
    scoreLabel: 'score:'
  },

  // Buttons
  buttons: {
    pause: 'PAUSE',
    resume: 'RESUME'
  },

  // In-game messages
  messages: {
    reachMe: 'REACH ME!',
    ranAway: 'HE RAN AWAY... AGAIN',
    entering: 'ENTERING %s',
    paused: 'PAUSED',
    pressResume: 'press esc or click resume',
    boom: 'BOOM! x3',
    heartPickup: '+BOOOM',
    fullHealth: 'FULL HEALTH!'
  },

  // Cutscene
  cutscene: {
    finally: 'FINALLY...',
    trueLove: 'TRUE LOVE! ♥',
    winSubtitle: 'he finally didn\'t run away!<br>those 7 levels were worth it...',
    playAgain: 'PLAY AGAIN',
    saveScore: 'SAVE SCORE',
    saveScorePrompt: 'your name (for the leaderboard):',
    leaderboardTitle: 'HIGH SCORES',
    savedFeedback: 'SAVED!',
    saveFailedFeedback: 'FAILED',
    winMusicVideoId: 'tAGnKpE4NCI'  // Metallica - Nothing Else Matters
  },

  // Death overlay
  death: {
    title: 'YOU LOST THE PRINCE!',
    subtitle: 'i know it\'s tiring, but would you like to try again?',
    retry: 'RETRY'
  },

  // Zones (name, bg, mapEmoji [array of 3], monsterCount, monsterSpeed, fleeSpeed, excuse, taunts)
  zones: [
    { name: 'THE DARK STREETS IN BERLIN',   bg: '#1a0028', mapEmoji: ['🇩🇪', '🌭', '🧛🏼'], monsterCount: 32, monsterSpeed: 1.0, fleeSpeed: 6,
      excuse: "I'M NOT READY!",
      taunts: ["YOU'LL NEVER CATCH ME!"] },
    { name: 'THE HAUNTED CAVE IN OAHU',    bg: '#001a0a', mapEmoji: ['🌺', '🐡', '🐉'], monsterCount: 52, monsterSpeed: 1.2, fleeSpeed: 8,
      excuse: "I FORGOT SOMETHING!",
      taunts: ["SO MANY MONSTERS!"] },
    { name: 'THE CURSED FOREST IN BRAZIL',  bg: '#0d1a00', mapEmoji: ['🍌', '🇧🇷', '🐅'], monsterCount: 72, monsterSpeed: 1.4, fleeSpeed: 10,
      excuse: "I LEFT THE OVEN ON!",
      taunts: ["I HAVE PLACES TO BE!"] },
    { name: 'THE DEMON SWAMP IN NEW ORLEANS',    bg: '#001a14', mapEmoji: ['🪦', '🕷️', '👹'], monsterCount: 88, monsterSpeed: 1.6, fleeSpeed: 12,
      excuse: "I NEED TO WASH MY HAIR!",
      taunts: ["SO CLOSE, YET SO FAR!"] },
    { name: 'THE GHOST ISLAND IN MALAYSIA',     bg: '#1a0800', mapEmoji: ['🇲🇾', '🐍', '👻'], monsterCount: 104, monsterSpeed: 1.8, fleeSpeed: 14,
      excuse: "MY MOM IS CALLING!",
      taunts: ["I'M NOT READY FOR COMMITMENT!"] },
    { name: 'THE FINAL FORTRESS IN DENVER', bg: '#08081a', mapEmoji: ['🏔️', '💍', '👽'], monsterCount: 120, monsterSpeed: 2.0, fleeSpeed: 16,
      excuse: "I AM SCARED!",
      taunts: ["MAYBE IN ANOTHER LIFE!"] },
    { name: 'THE SECRET ROSE GARDEN',    bg: '#1a0512', mapEmoji: ['👩🏻‍❤️‍💋‍👨🏻', '🤖', '🌹'], monsterCount: 140, monsterSpeed: 2.2, fleeSpeed: 0,
      excuse: null,
      taunts: ["MAYBE I\'LL STAY..."] }
  ],

  // Monster types (name, color, eyeColor, hp, speed, damage, size, loot)
  monsterTypes: [
    { name: 'goblin',   color: '#2d5a27', eyeColor: '#6b6b00', hp: 30,  speed: 1.1, damage: 8,  size: 14, loot: 50  },
    { name: 'wraith',   color: '#2e1065', eyeColor: '#a78bfa', hp: 50,  speed: 1.4, damage: 12, size: 16, loot: 80  },
    { name: 'ogre',     color: '#5c1a1a', eyeColor: '#cc2222', hp: 100, speed: 0.7, damage: 20, size: 22, loot: 150 },
    { name: 'bat',      color: '#1e293b', eyeColor: '#ff3333', hp: 20,  speed: 2.0, damage: 6,  size: 10, loot: 30  },
    { name: 'skeleton', color: '#5c5044', eyeColor: '#8b0000', hp: 40,  speed: 1.3, damage: 10, size: 15, loot: 60  }
  ]
};
