const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

console.log('Using ffmpeg at:', ffmpegPath);

const videoPath = path.resolve(__dirname, 'src/assets/Video/Laptop.mp4');
const outDir = path.resolve(__dirname, 'public/frames');

if (!fs.existsSync(videoPath)) {
  console.error('Video file not found at:', videoPath);
  process.exit(1);
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
} else {
  // Clear old frames
  console.log('Cleaning old frames...');
  const files = fs.readdirSync(outDir);
  for (const file of files) {
    if (file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.webp') || file.endsWith('.png')) {
      fs.unlinkSync(path.join(outDir, file));
    }
  }
}

console.log('Extracting ULTRA HIGH QUALITY frames (1080p 1920x1080, Q95 + Unsharp Enhancement) from Laptop.mp4...');
const outPattern = path.join(outDir, 'frame_%04d.webp');

const result = spawnSync(ffmpegPath, [
  '-i', videoPath,
  '-vf', 'fps=30,scale=1920:1080:flags=lanczos,unsharp=lx=5:ly=5:la=0.7:cx=5:cy=5:ca=0.3',
  '-c:v', 'libwebp',
  '-preset', 'photo',
  '-quality', '95',
  '-compression_level', '6',
  outPattern
], { stdio: 'inherit' });

if (result.error) {
  console.error('Error extracting frames:', result.error);
  process.exit(1);
}

// Keep frames up to 176 (remove 0177 to end)
const allFiles = fs.readdirSync(outDir).filter(f => f.endsWith('.webp'));
for (const file of allFiles) {
  const match = file.match(/^frame_(\d+)\.webp$/);
  if (match && parseInt(match[1], 10) >= 177) {
    fs.unlinkSync(path.join(outDir, file));
  }
}

// Count generated frames
const finalFiles = fs.readdirSync(outDir).filter(f => f.endsWith('.webp'));
console.log(`Successfully retained ${finalFiles.length} WebP frames (1 to 176) in ${outDir}`);

