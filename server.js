const express = require('express');
const path = require('path');
const { generatePost } = require('./imageGenerator');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Generator Postów na Instagram</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #f0f2f5; margin: 0; padding: 30px; color: #1c1e21; }
        .container { max-width: 1100px; margin: 0 auto; background: white; padding: 32px; border-radius: 20px; box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
        h1 { margin-top: 0; font-size: 28px; color: #111; display: flex; align-items: center; gap: 10px; }
        p.subtitle { color: #606770; margin-bottom: 24px; }
        
        .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; }
        
        .section-label { font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #65676b; margin-bottom: 8px; display: block; }
        
        .date-picker-group { background: #f7f8fa; padding: 16px; border-radius: 12px; border: 1px solid #e4e6eb; margin-bottom: 20px; }
        .row { display: flex; gap: 10px; margin-bottom: 10px; }
        
        input[type="date"], input[type="time"] { padding: 10px 12px; border: 1px solid #ccd0d5; border-radius: 8px; font-size: 14px; background: white; }
        input[type="date"] { flex: 2; }
        input[type="time"] { flex: 1; }

        .quick-buttons { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
        .chip { background: #e4e6eb; border: none; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .chip:hover { background: #d8dadf; }
        .chip.primary { background: #e7f3ff; color: #1877f2; }
        .chip.primary:hover { background: #dbeafe; }

        .btn-add { background: #00a884; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; font-size: 15px; transition: background 0.2s; }
        .btn-add:hover { background: #008f70; }

        .slots-list { list-style: none; padding: 0; margin: 0 0 20px 0; max-height: 180px; overflow-y: auto; border: 1px solid #e4e6eb; border-radius: 10px; }
        .slots-list li { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: white; border-bottom: 1px solid #f0f2f5; font-size: 14px; font-weight: 500; }
        .slots-list li:last-child { border-bottom: none; }
        .btn-remove { background: #ffebe9; color: #ce1f2d; border: none; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; }
        .btn-remove:hover { background: #ffd7d5; }

        select { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccd0d5; font-size: 15px; background: white; margin-bottom: 20px; }
        
        .btn-generate { width: 100%; padding: 16px; background: #e1007b; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.1s, background 0.2s; }
        .btn-generate:hover { background: #c00068; }
        .btn-generate:active { transform: scale(0.99); }

        .preview-box { background: #f7f8fa; border: 2px dashed #ccd0d5; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; position: relative; }
        img { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); display: none; }
        .loader { display: none; border: 4px solid #f3f3f3; border-top: 4px solid #e1007b; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 12px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✨ Generator Wolnych Terminów</h1>
        <p class="subtitle">Klikaj i wybieraj terminy – szybko, łatwo i bez konieczności wpisywania ręcznie!</p>
        
        <div class="layout">
          <div>
            <span class="section-label">1. Wybierz termin</span>
            <div class="date-picker-group">
              <div class="quick-buttons">
                <button class="chip primary" onclick="setQuickDate(0)">Dzisiaj</button>
                <button class="chip primary" onclick="setQuickDate(1)">Jutro</button>
                <button class="chip primary" onclick="setQuickDate(2)">Pojutrze</button>
              </div>

              <div class="row">
                <input type="date" id="dateInput">
                <input type="time" id="timeInput" value="12:00">
              </div>

              <div class="quick-buttons">
                <span style="font-size: 12px; color: #65676b; margin-right: 4px; align-self: center;">Szybkie godziny:</span>
                <button class="chip" onclick="setTime('09:00')">09:00</button>
                <button class="chip" onclick="setTime('11:00')">11:00</button>
                <button class="chip" onclick="setTime('14:00')">14:00</button>
                <button class="chip" onclick="setTime('16:00')">16:00</button>
                <button class="chip" onclick="setTime('18:00')">18:00</button>
              </div>

              <button class="btn-add" onclick="addSlot()">+ Dodaj termin do listy</button>
            </div>

            <span class="section-label">2. Lista terminów na grafice</span>
            <ul class="slots-list" id="slotsList"></ul>

            <span class="section-label">3. Wybierz styl graficzny</span>
            <select id="styleSelect">
              <option value="1">1. Elegancki Ciemny ze Złotem</option>
              <option value="2">2. Jasny Pudrowy / Minimalistyczny</option>
              <option value="3">3. Modern Neon Dark</option>
            </select>

            <button class="btn-generate" onclick="generate()">🎨 Wygeneruj Posta</button>
          </div>

          <div class="preview-box">
            <div class="loader" id="loader"></div>
            <p id="placeholderText" style="color: #65676b;">Dodaj terminy i kliknij "Wygeneruj Posta", aby wyświetlić grafikę.</p>
            <img id="resultImage" alt="Podgląd posta">
          </div>
        </div>
      </div>

      <script>
        const slots = [];
        const daysOfWeek = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

        // Domyślna dzisiejsza data
        document.getElementById('dateInput').valueAsDate = new Date();

        function setQuickDate(offsetDays) {
          const d = new Date();
          d.setDate(d.getDate() + offsetDays);
          document.getElementById('dateInput').valueAsDate = d;
        }

        function setTime(timeStr) {
          document.getElementById('timeInput').value = timeStr;
        }

        function addSlot() {
          const dateVal = document.getElementById('dateInput').value;
          const timeVal = document.getElementById('timeInput').value;

          if (!dateVal || !timeVal) {
            alert('Wybierz datę i godzinę!');
            return;
          }

          const dateObj = new Date(dateVal);
          const dayName = daysOfWeek[dateObj.getDay()];
          const formattedDate = \`\${dayName} - \${timeVal}\`;

          slots.push(formattedDate);
          renderSlots();
        }

        function removeSlot(index) {
          slots.splice(index, 1);
          renderSlots();
        }

        function renderSlots() {
          const list = document.getElementById('slotsList');
          list.innerHTML = '';

          if (slots.length === 0) {
            list.innerHTML = '<li style="color: #888; justify-content: center;">Brak dodanych terminów. Wybierz datę powyżej.</li>';
            return;
          }

          slots.forEach((slot, index) => {
            const li = document.createElement('li');
            li.innerHTML = \`
              <span>📅 \${slot}</span>
              <button class="btn-remove" onclick="removeSlot(\${index})">Usuń</button>
            \`;
            list.appendChild(li);
          });
        }

        async function generate() {
          if (slots.length === 0) {
            alert('Dodaj przynajmniej jeden termin do listy!');
            return;
          }

          const loader = document.getElementById('loader');
          const placeholder = document.getElementById('placeholderText');
          const img = document.getElementById('resultImage');

          loader.style.display = 'block';
          placeholder.style.display = 'none';
          img.style.display = 'none';

          const style = document.getElementById('styleSelect').value;

          try {
            const response = await fetch('/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slots, style })
            });

            if (response.ok) {
              // Wymuszamy pobranie nowej grafiki bez pamięci podręcznej (cache-busting)
              img.src = '/post.png?v=' + Date.now();
              img.onload = () => {
                loader.style.display = 'none';
                img.style.display = 'block';
              };
            } else {
              alert('Wystąpił błąd podczas generowania obrazu.');
              loader.style.display = 'none';
              placeholder.style.display = 'block';
            }
          } catch (e) {
            alert('Błąd połączenia z serwerem.');
            loader.style.display = 'none';
            placeholder.style.display = 'block';
          }
        }

        renderSlots();
      </script>
    </body>
    </html>
  `);
});

app.post('/generate', async (req, res) => {
  try {
    const { slots, style } = req.body;
    await generatePost(slots, style, './post.png');
    res.json({ success: true });
  } catch (error) {
    console.error('Błąd generowania:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serwer uruchomiony na: http://localhost:${PORT}`);
});