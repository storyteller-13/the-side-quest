/**
 * Game configuration: all user-facing text and content data.
 */
window.CONFIG = {
  // Page & overlay
  title: 'The Side Quest',
  overlayTitle: 'THE SIDE QUEST',
  subtitle: 'Fight your way to the prince',
  startButton: 'START GAME',
  controls: [
    { keys: 'WASD / Arrow Keys', action: 'Move' },
    { keys: 'Space / Left Click', action: 'Melee Attack' },
    { keys: 'E / Right Click', action: 'Throw Heart (hold to charge)' }
  ],

  // HUD
  hud: {
    health: 'Health',
    loveMeter: 'Love Meter',
    ammo: 'Ammo',
    ammoFormat: 'HEARTS: %d',
    wantedStar: '♥'
  },

  // Buttons
  buttons: {
    pause: 'PAUSE',
    resume: 'RESUME'
  },

  // In-game messages
  messages: {
    reachMe: 'REACH ME!',
    ranAway: 'HE RAN AWAY... AGAIN.',
    entering: 'ENTERING %s',
    paused: 'PAUSED',
    pressResume: 'Press ESC or click RESUME',
    boom: 'BOOM! x3',
    heartPickup: '+HEART'
  },

  // Cutscene
  cutscene: {
    finally: 'FINALLY...',
    trueLove: 'TRUE LOVE! ♥',
    winSubtitle: 'He finally stayed. All 7 levels worth it.',
    playAgain: 'PLAY AGAIN'
  },

  // Death overlay
  death: {
    title: 'YOU FELL',
    subtitle: 'The prince waits... try again',
    retry: 'RETRY'
  },

  // Zones (name, bg, monsterCount, monsterSpeed, fleeSpeed, excuse, taunts)
  zones: [
    { name: 'ZONE 1 - THE DARK STREETS',   bg: '#1a0028', monsterCount: 8,  monsterSpeed: 1.0, fleeSpeed: 6,
      excuse: "I'M NOT READY!!",
      taunts: ["NICE TRY!", "YOU'LL NEVER CATCH ME!", "THESE MONSTERS LOOK FRIENDLY!"] },
    { name: 'ZONE 2 - HAUNTED GARDENS',    bg: '#001a0a', monsterCount: 13, monsterSpeed: 1.2, fleeSpeed: 8,
      excuse: "I FORGOT SOMETHING!!",
      taunts: ["I'M VERY FAST!", "GOOD LUCK WITH THOSE!", "SO MANY MONSTERS! BYE!"] },
    { name: 'ZONE 3 - THE CURSED FOREST',  bg: '#050f00', monsterCount: 18, monsterSpeed: 1.4, fleeSpeed: 10,
      excuse: "I LEFT THE OVEN ON!!",
      taunts: ["THE FOREST IS LOVELY!", "ARE YOU LOST?", "I HAVE PLACES TO BE!"] },
    { name: 'ZONE 4 - THE DEMON SWAMP',    bg: '#001010', monsterCount: 22, monsterSpeed: 1.6, fleeSpeed: 12,
      excuse: "I NEED TO WASH MY HAIR!!",
      taunts: ["THE SWAMP IS LOVELY!", "A MONSTER IS BEHIND YOU!", "BYE BYE!"] },
    { name: 'ZONE 5 - THE FIRE CAVES',     bg: '#1a0500', monsterCount: 26, monsterSpeed: 1.8, fleeSpeed: 14,
      excuse: "MY MOM IS CALLING!!",
      taunts: ["IT'S HOT IN HERE!", "NICE TRY!", "I'M NOT READY FOR COMMITMENT!"] },
    { name: 'ZONE 6 - THE FINAL FORTRESS', bg: '#100010', monsterCount: 30, monsterSpeed: 2.0, fleeSpeed: 16,
      excuse: "...ALMOST! ONE MORE LEVEL!!",
      taunts: ["SO CLOSE, YET SO FAR!", "MAYBE IN ANOTHER LIFE!", "...ok maybe after this one"] },
    { name: 'ZONE 7 - THE ROSE GARDEN',    bg: '#1a0015', monsterCount: 35, monsterSpeed: 2.2, fleeSpeed: 0,
      excuse: null,
      taunts: ["...wait, maybe I'll stay...", "you're very persistent...", "ok ok ok ok"] }
  ],

  // Monster types (name, color, eyeColor, hp, speed, damage, size, loot)
  monsterTypes: [
    { name: 'Goblin',   color: '#4ade80', eyeColor: '#ff0', hp: 30,  speed: 1.1, damage: 8,  size: 14, loot: 50  },
    { name: 'Wraith',   color: '#a78bfa', eyeColor: '#fff', hp: 50,  speed: 1.4, damage: 12, size: 16, loot: 80  },
    { name: 'Ogre',     color: '#f87171', eyeColor: '#ff0', hp: 100, speed: 0.7, damage: 20, size: 22, loot: 150 },
    { name: 'Bat',      color: '#94a3b8', eyeColor: '#f00', hp: 20,  speed: 2.0, damage: 6,  size: 10, loot: 30  },
    { name: 'Skeleton', color: '#e2e8f0', eyeColor: '#f00', hp: 40,  speed: 1.3, damage: 10, size: 15, loot: 60  }
  ]
};
