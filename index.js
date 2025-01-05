const mineflayer = require('mineflayer');
const fs = require('fs');

// Membaca file konfigurasi config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Fungsi untuk membuat bot
function createBot() {
  const bot = mineflayer.createBot({
    host: config.host,       // Alamat server Minecraft
    port: config.port,       // Port server Minecraft
    username: config.username, // Username bot
    version: config.version  // Versi Minecraft
  });

  // Fungsi untuk menangani bot saat spawn (login dan registrasi otomatis)
  function handleBot(bot) {
    bot.on("login", () => {
      bot.chat("/login p@ssword123");         // Login dengan password langsung
      bot.chat('/register p@ssword123 p@ssword123');  // Registrasi dengan password langsung
    });
  }

  // Fungsi untuk menjaga bot tetap aktif (anti-AFK)
  function antiAfk() {
    setInterval(() => {
      const directions = ['forward', 'back', 'left', 'right'];
      const randomDirection = directions[Math.floor(Math.random() * directions.length)];

      bot.setControlState(randomDirection, true);
      setTimeout(() => {
        bot.setControlState(randomDirection, false);
      }, Math.floor(Math.random() * (4000 - 1000) + 1000)); // Gerakkan acak selama 1-4 detik
    }, 10000); // Setiap 10 detik
  }

  // Event ketika bot berhasil spawn
  bot.on('spawn', () => {
    console.log('Bot telah berhasil masuk ke server!');
    handleBot(bot); // Menangani login dan registrasi saat spawn
    antiAfk();      // Aktifkan anti-AFK
  });

  // Event ketika bot terputus dari server
  bot.on('end', () => {
    console.log('Bot telah terputus dari server! Mencoba untuk reconnect...');
    setTimeout(createBot, 5000); // Reconnect setelah 5 detik
  });

  // Event ketika bot gagal untuk terhubung ke server
  bot.on('error', (err) => {
    console.log('Terjadi error: ' + err + '. Mencoba untuk reconnect...');
    setTimeout(createBot, 5000); // Reconnect setelah 5 detik
  });
}

// Membuat bot untuk pertama kali
createBot();
