const express = require('express');
const multer = require('multer');
const { generatePost, generateBeforeAfter } = require('./imageGenerator');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.static('.'));

// Endpoint dla zwykłych postów
app.post('/generate', async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    const buffer = await generatePost(title, subtitle);
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating image');
  }
});

// Endpoint dla modułu Przed i Po (obsługa 2 plików)
app.post('/generate-before-after', upload.fields([
  { name: 'before', maxCount: 1 },
  { name: 'after', maxCount: 1 }
]), async (req, res) => {
  try {
    const beforeFile = req.files['before'] ? req.files['before'][0].buffer : null;
    const afterFile = req.files['after'] ? req.files['after'][0].buffer : null;
    const { aspectRatio, title } = req.body;

    if (!beforeFile || !afterFile) {
      return res.status(400).send('Oba zdjęcia są wymagane.');
    }

    const buffer = await generateBeforeAfter(beforeFile, afterFile, aspectRatio, title);
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating before/after image');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});