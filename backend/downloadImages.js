require('dotenv').config();
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Cafe = require('./src/models/Cafe');

const PUBLIC_DIR = path.resolve(__dirname, '..', 'frontend', 'public');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    lib.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  const cafes = await Cafe.find({ image: /^https?:\/\// });
  console.log(`Downloading images for ${cafes.length} cafes...\n`);

  for (const cafe of cafes) {
    const filename = `${slugify(cafe.name)}.jpg`;
    const dest = path.join(PUBLIC_DIR, filename);

    if (fs.existsSync(dest)) {
      await Cafe.updateOne({ _id: cafe._id }, { image: `/${filename}` });
      console.log(`⏭️  ${cafe.name}: already exists`);
      continue;
    }

    try {
      await download(cafe.image, dest);
      await Cafe.updateOne({ _id: cafe._id }, { image: `/${filename}` });
      console.log(`✅ ${cafe.name} → /${filename}`);
    } catch (err) {
      console.log(`⚠️  ${cafe.name}: failed (${err.message})`);
    }
  }

  console.log('\n🎉 Done! Commit frontend/public/*.jpg ke GitHub setelah ini.');
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
