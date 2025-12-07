const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const upload = multer({ dest: 'uploads/' });

// Dummy IR and amp sim database
const IR_FILES = [
  { name: 'Modern Metal', file: 'modern_metal.wav', eq: [5, 7, 6, 8, 7] },
  { name: 'Vintage British', file: 'vintage_brit.wav', eq: [6, 5, 7, 6, 5] },
  { name: 'Classic Rock', file: 'classic_rock.wav', eq: [7, 6, 5, 7, 6] },
];
const AMP_PROFILES = [
  { name: '5150', eq: [5, 8, 6, 7, 8], gain: 8, presence: 7 },
  { name: 'JCM800', eq: [7, 6, 7, 5, 6], gain: 6, presence: 6 },
  { name: 'Rectifier', eq: [6, 7, 8, 7, 7], gain: 9, presence: 8 },
];

// Dummy EQ analyzer
function analyzeEQ(filePath) {
  // In a real implementation, analyze the audio file's EQ profile
  // Here, return a random profile for demonstration
  return [Math.floor(Math.random()*10), Math.floor(Math.random()*10), Math.floor(Math.random()*10), Math.floor(Math.random()*10), Math.floor(Math.random()*10)];
}

function suggestAmpSim(eqProfile) {
  // Find the closest amp profile by Euclidean distance
  let best = AMP_PROFILES[0];
  let minDist = Infinity;
  for (const amp of AMP_PROFILES) {
    const dist = Math.sqrt(amp.eq.reduce((sum, val, i) => sum + Math.pow(val - eqProfile[i], 2), 0));
    if (dist < minDist) {
      minDist = dist;
      best = amp;
    }
  }
  return best;
}

function chooseIR(eqProfile) {
  // Find the closest IR by Euclidean distance
  let best = IR_FILES[0];
  let minDist = Infinity;
  for (const ir of IR_FILES) {
    const dist = Math.sqrt(ir.eq.reduce((sum, val, i) => sum + Math.pow(val - eqProfile[i], 2), 0));
    if (dist < minDist) {
      minDist = dist;
      best = ir;
    }
  }
  return best;
}

app.post('/analyze-tone', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }
  const eqProfile = analyzeEQ(req.file.path);
  const amp = suggestAmpSim(eqProfile);
  const ir = chooseIR(eqProfile);
  // Clean up uploaded file
  fs.unlink(req.file.path, () => {});
  res.json({
    tone_preset: {
      amp: {
        name: amp.name,
        gain: amp.gain,
        presence: amp.presence,
        eq: amp.eq
      },
      ir: {
        name: ir.name,
        file: ir.file
      },
      eq_profile: eqProfile
    }
  });
});

app.listen(4000, () => {
  console.log('Tone analysis service running on port 4000');
});
