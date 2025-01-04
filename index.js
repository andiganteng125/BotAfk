const mineflayer = require('mineflayer');
const readline = require('readline');

// Buat interface untuk membaca input dari terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Tanya pengguna untuk memasukkan data
rl.question('What is the IP of your server? ', (host) => {
  rl.question('What is the port of your server? ', (port) => {
    rl.question('What is the username for your bot? ', (username) => {
      rl.question('What is the password for your bot? ', (password) => {
        rl.question('What is the version of your server? ', (version) => {
          rl.close();
          startBot({ host, port: parseInt(port, 10), username, password, version });
        });
      });
    });
  });
});

// Fungsi untuk membuat bot
function startBot({ host, port, username, password, version }) {
  function createBot(botNumber = 1) {
    const bot = mineflayer.createBot({
      host,
      port,
      username: `${username}${botNumber}`, // Tambahkan nomor bot untuk membedakan username
      version,
    });

    handleBot(bot, botNumber);

    bot.on('end', () => {
      console.log(`Bot ${bot.username} disconnected. Reconnecting in 5 seconds...`);
      setTimeout(() => createBot(botNumber), 5000); // Reconnect setelah 5 detik
    });

    bot.on('error', (err) => console.log(`Error on bot ${bot.username}: ${err}`));
  }

  // Jalankan bot pertama kali
  createBot();
}

// Fungsi untuk menangani login dan aktivitas bot
function handleBot(bot, botNumber) {
  bot.on('login', () => {
    bot.chat(`/login ${password}`); // Perintah login
    bot.chat(`/register ${password} ${password}`); // Perintah register jika belum terdaftar

    console.log(`Bot ${bot.username} successfully logged in.`);
    startAntiAfk(bot);
    randomWalk(bot);
  });
}

// Fungsi anti-AFK
function startAntiAfk(bot) {
  setInterval(() => {
    bot.swingArm('right'); // Mengayunkan tangan
    bot.setControlState('jump', true); // Melompat
    setTimeout(() => bot.setControlState('jump', false), 500); // Berhenti melompat setelah durasi tertentu
  }, 30000); // Ulangi setiap interval
}

// Fungsi untuk bergerak secara acak
function randomWalk(bot) {
  const directions = ['forward', 'back', 'left', 'right'];

  setInterval(() => {
    const direction = directions[Math.floor(Math.random() * directions.length)];
    bot.setControlState(direction, true);
    setTimeout(() => bot.setControlState(direction, false), 1000); // Berhenti setelah durasi tertentu
  }, 10000); // Ulangi setiap interval
}
