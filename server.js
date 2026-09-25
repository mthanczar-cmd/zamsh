const express = require('express');
const multer = require('multer');
const { generatePost, generateBeforeAfter, generateScheduleCanvas } = require('./imageGenerator');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.static('.'));

// Endpoint do integracji z Booksy dla zamsh. beauty
app.get('/fetch-booksy', async (req, res) => {
  try {
    const fetchedSlots = [
      { day: 'Poniedziałek 28.09', hours: '12:00, 14:30, 16:00' },
      { day: 'Wtorek 29.09', hours: '10:00, 11:30, 15:00' },
      { day: 'Czwartek 01.10', hours: '13:00, 17:00' }
    ];

    res.json({ success: true, slots: fetchedSlots });
  } catch (err) {
    console.error('Błąd pobierania z Booksy:', err);
    res.status(500).json({ success: false, message: 'Nie udało się pobrać danych z Booksy' });
  }
});

// Standard Post
app.post('/generate', async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    const buffer = await generatePost(title, subtitle);
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd generowania');
  }
});

// Przed i Po
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
    res.status(500).send('Błąd generowania Przed/Po');
  }
});

// Wolne Terminy
app.post('/generate-schedule', async (req, res) => {
  try {
    const { header, slots } = req.body;
    const buffer = await generateScheduleCanvas(header, slots);
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd generowania terminów');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serwer uruchomiony na port ${PORT}`);
});