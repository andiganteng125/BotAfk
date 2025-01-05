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

  // Fungsi untuk menangani login dan registrasi otomatis
  function handleBot(bot) {
    bot.on("login", () => {
      bot.chat("/login p@ssword123");         // Login dengan password langsung
      bot.chat('/register p@ssword123 p@ssword123');  // Registrasi dengan password langsung
    });
  }

  // Fungsi anti-AFK
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

  // Fungsi melompati lebih dari satu blok
  function jumpOverBlocks() {
    setInterval(() => {
      const blockInFront = bot.blockAt(bot.entity.position.offset(0, 0, 1));
      const blockAbove = bot.blockAt(bot.entity.position.offset(0, 1, 1));

      if ((blockInFront && blockInFront.name !== 'air') || (blockAbove && blockAbove.name !== 'air')) {
        bot.jump(); // Lompat jika ada blok di depan atau di atas
      }
    }, 1000); // Cek setiap detik
  }

  // Fungsi menghindari lava dan monster
  function avoidLavaAndMonsters() {
    setInterval(() => {
      const blockInFront = bot.blockAt(bot.entity.position.offset(0, 0, 1));
      const blockBelow = bot.blockAt(bot.entity.position.offset(0, -1, 0));

      // Hindari lava
      if (blockInFront && blockInFront.name === 'lava' || blockBelow && blockBelow.name === 'lava') {
        bot.setControlState('back', true);
        setTimeout(() => bot.setControlState('back', false), 500); // Mundur selama 500ms
      }

      // Hindari monster
      const nearbyEntities = bot.entities;
      Object.keys(nearbyEntities).forEach((entityId) => {
        const entity = nearbyEntities[entityId];
        if (entity.mobType && entity.mobType !== 'Player') {
          const dx = entity.position.x - bot.entity.position.x;
          const dz = entity.position.z - bot.entity.position.z;
          if (Math.abs(dx) < 3 && Math.abs(dz) < 3) {
            bot.setControlState('back', true);
            setTimeout(() => bot.setControlState('back', false), 1000); // Mundur selama 1 detik
          }
        }
      });
    }, 1000); // Cek setiap detik
  }

  // Fungsi menghindari tenggelam
  function avoidDrowning() {
    setInterval(() => {
      if (bot.entity.position.y < 0) {
        bot.setControlState('jump', true); // Lompat untuk menghindari tenggelam
        setTimeout(() => bot.setControlState('jump', false), 500); // Lompat selama 500ms
      }
    }, 1000); // Cek setiap detik
  }

  // Event ketika bot berhasil spawn
  bot.on('spawn', () => {
    console.log('Bot telah berhasil masuk ke server!');
    handleBot(bot); // Menangani login dan registrasi saat spawn
    antiAfk();      // Aktifkan anti-AFK
    jumpOverBlocks(); // Aktifkan fitur melompati blok
    avoidLavaAndMonsters(); // Hindari lava dan monster
    avoidDrowning(); // Hindari tenggelam
  });

  // Event untuk menangani pesan dari chat server
  bot.on('message', (message) => {
    // Tanpa log
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
      
