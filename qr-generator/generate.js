const fs = require('fs');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const path = require('path');

const SEATS_FILE = './seats.json';
const OUTPUT_FILE = './output/stickers.pdf';

// Config
const DOMAIN = 'http://192.168.0.14:3333/seat'; // Pointing to our local backend for now, or app domain
const PAGE_MARGIN = 20;
const COLS = 4;
const ROWS = 6;
const STICKER_WIDTH = 130;  // Approx 4.5cm
const STICKER_HEIGHT = 130; // Approx 4.5cm
const GAP_X = 10;
const GAP_Y = 10;

async function generate() {
    console.log('🚀 Iniciando gerador de QR Codes...');

    const seats = JSON.parse(fs.readFileSync(SEATS_FILE, 'utf8'));
    console.log(`📋 ${seats.length} assentos carregados.`);

    if (!fs.existsSync('./output')) {
        fs.mkdirSync('./output');
    }

    const doc = new PDFDocument({ margin: PAGE_MARGIN, size: 'A4' });
    doc.pipe(fs.createWriteStream(OUTPUT_FILE));

    let col = 0;
    let row = 0;

    for (const seatId of seats) {
        // 1. Generate QR
        const url = `${DOMAIN}/${seatId}`;
        const qrBuffer = await QRCode.toBuffer(url, { width: 100, margin: 1 });

        // 2. Calculate Position
        const x = PAGE_MARGIN + (col * (STICKER_WIDTH + GAP_X));
        const y = PAGE_MARGIN + (row * (STICKER_HEIGHT + GAP_Y));

        // 3. Draw Border (Cut Line) - Optional dashed line
        doc.rect(x, y, STICKER_WIDTH, STICKER_HEIGHT)
            .lineWidth(0.5)
            .dash(5, { space: 5 })
            .strokeColor('#ccc')
            .stroke();

        doc.undash(); // Reset dash

        // 4. Draw QR Code
        doc.image(qrBuffer, x + 15, y + 5, { width: 100 });

        // 5. Draw Text
        doc.font('Helvetica-Bold')
            .fontSize(14)
            .fillColor('black')
            .text(seatId, x, y + 105, {
                width: STICKER_WIDTH,
                align: 'center'
            });

        // 6. Move to next grid position
        col++;
        if (col >= COLS) {
            col = 0;
            row++;
            if (row >= ROWS) {
                row = 0;
                doc.addPage();
            }
        }
    }

    doc.end();
    console.log(`✅ PDF gerado em: ${OUTPUT_FILE}`);
}

generate().catch(console.error);
