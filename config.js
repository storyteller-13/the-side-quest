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
    { keys: 'e / right click', action: 'throw heart (hold to charge)' },
    { keys: 'esc', action: 'pause the game' }
  ],

  // HUD
  hud: {
    health: 'health',
    loveMeter: 'lovemeter',
    ammo: 'ammo',
    ammoFormat: 'HEARTS: %d',
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
    heartPickup: '+HEART'
  },

  // Cutscene
  cutscene: {
    finally: 'FINALLY...',
    trueLove: 'TRUE LOVE! ♥',
    winSubtitle: 'he finally didn\'t run away!<br>all 7 levels worth it...',
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
    subtitle: 'i know it\'s tiring, but do you want to give it another try?',
    retry: 'RETRY'
  },

  // Zones (name, bg, monsterCount, monsterSpeed, fleeSpeed, excuse, taunts)
  zones: [
    { name: 'THE DARK STREETS OF BERLIN',   bg: '#1a0028', monsterCount: 8,  monsterSpeed: 1.0, fleeSpeed: 6,
      excuse: "I'M NOT READY!",
      taunts: ["YOU'LL NEVER CATCH ME!"] },
    { name: 'HAUNTED GARDENS IN OAHU',    bg: '#001a0a', monsterCount: 13, monsterSpeed: 1.2, fleeSpeed: 8,
      excuse: "I FORGOT SOMETHING!",
      taunts: ["SO MANY MONSTERS!"] },
    { name: 'THE CURSED FOREST OF BRAZIL',  bg: '#0d1a00', monsterCount: 18, monsterSpeed: 1.4, fleeSpeed: 10,
      excuse: "I LEFT THE OVEN ON!",
      taunts: ["I HAVE PLACES TO BE!"] },
    { name: 'THE DEMON SWAMP OF NEW ORLEANS',    bg: '#001a14', monsterCount: 22, monsterSpeed: 1.6, fleeSpeed: 12,
      excuse: "I NEED TO WASH MY HAIR!",
      taunts: ["SO CLOSE, YET SO FAR!"] },
    { name: 'THE LOST ISLAND OF MALAYSIA',     bg: '#1a0800', monsterCount: 26, monsterSpeed: 1.8, fleeSpeed: 14,
      excuse: "MY MOM IS CALLING!",
      taunts: ["I'M NOT READY FOR COMMITMENT!"] },
    { name: 'THE FINAL FORTRESS IN DENVER', bg: '#08081a', monsterCount: 30, monsterSpeed: 2.0, fleeSpeed: 16,
      excuse: "I AM SCARED!",
      taunts: ["MAYBE IN ANOTHER LIFE!"] },
    { name: 'THE SECRET ROSE GARDEN',    bg: '#1a0512', monsterCount: 35, monsterSpeed: 2.2, fleeSpeed: 0,
      excuse: null,
      taunts: ["MAYBE I\'LL STAY..."] }
  ],

  // Monster types (name, color, eyeColor, hp, speed, damage, size, loot)
  monsterTypes: [
    { name: 'goblin',   color: '#4ade80', eyeColor: '#ff0', hp: 30,  speed: 1.1, damage: 8,  size: 14, loot: 50  },
    { name: 'wraith',   color: '#a78bfa', eyeColor: '#fff', hp: 50,  speed: 1.4, damage: 12, size: 16, loot: 80  },
    { name: 'ogre',     color: '#f87171', eyeColor: '#ff0', hp: 100, speed: 0.7, damage: 20, size: 22, loot: 150 },
    { name: 'bat',      color: '#94a3b8', eyeColor: '#f00', hp: 20,  speed: 2.0, damage: 6,  size: 10, loot: 30  },
    { name: 'skeleton', color: '#e2e8f0', eyeColor: '#f00', hp: 40,  speed: 1.3, damage: 10, size: 15, loot: 60  }
  ]
};
