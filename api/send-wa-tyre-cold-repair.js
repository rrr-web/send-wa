export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.WABLAS_API_TOKEN) {
      return res.status(500).json({ error: 'API token missing' });
    }
    
    const data = req.body;
    const groupIds = ['120363321280823963'];
    // const groupIds = ['6282236924872'];
  
    const message = formatMessage(data);
  
    try {
      const response = await retryFetch('https://tegal.wablas.com/api/v2/send-message', {
        method: 'POST',
        headers: {
          'Authorization': process.env.WABLAS_API_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: groupIds.map(id => ({
            phone: id,
            message,
            isGroup: true
          }))
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Wablas API error:', response.status, errorText);
        return res.status(500).json({ error: 'Wablas API failed', status: response.status, errorText });
      }
  
      const result = await response.json();
      console.log('Wablas response:', result);
  
      if (result.status) {
        res.status(200).json({ message: 'Success', result });
      } else {
        res.status(500).json({ error: result.error || 'Failed to send message' });
      }
  
    } catch (err) {
      console.error('Unexpected error:', err);
      res.status(500).json({ error: err.message });
    }
  }

     async function retryFetch(url, options, retries = 3, delay = 500, timeout = 8000) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) return res;
      console.warn(`Retry ${i + 1}: Response not ok (${res.status})`);
    } catch (err) {
      console.warn(`Retry ${i + 1}:`, err.name, err.message);
      if (i === retries - 1 ) throw err;
    } finally {
      clearTimeout(timer);
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
  
  function formatMessage(data) {
    const {
      tanggal, sn, brand, pattern, size, waktuinspeksi, jumlahtitik,
      titik11, dimensi11, penyebabkerusakan11, prosesrepair11, areakerusakan11,
      titik121, titik222, dimensi121, dimensi222, penyebabkerusakan121, penyebabkerusakan222, prosesrepair121, prosesrepair222, areakerusakan121, areakerusakan222,
      titik131, titik232, titik333, dimensi131, dimensi232, dimensi333, penyebabkerusakan131, penyebabkerusakan232, penyebabkerusakan333, prosesrepair131, prosesrepair232, prosesrepair333, areakerusakan131, areakerusakan232, areakerusakan333,
      cements2000pn5252161,hardenerforsc2000pn5251151,solventpn5959125,patchfabricatedpnptcbc,
      rfu
    } = data;
  
    let message =
      '🟦 🟦 🟦\n\n' +
      'Cold Repair Tyre🛞\n\n' +
      `🗓️Tanggal: ${tanggal}\n` +
      `SN: ${sn}\n` +
      `Brand: ${brand}\n` +
      `Pattern: ${pattern}\n` +
      `Size: ${size}\n` +
      `Waktu Inspeksi: ${waktuinspeksi}\n` +
      `Jumlah Titik: ${jumlahtitik}\n\n`;
  
    if (titik11 || dimensi11 || penyebabkerusakan11 || prosesrepair11 || areakerusakan11) {
      message +=
        '🛠️Repair 1🛠️\n' +
        `Titik 1: ${titik11}\n` +
        `Area Kerusakan 1: ${areakerusakan11}\n` +
        `Proses Repair 1: ${prosesrepair11}\n` +
        `Dimensi 1: ${dimensi11}\n` +
        `Penyebab Kerusakan 1: ${penyebabkerusakan11}\n\n`;
    }
  
    if (titik121 || titik222 || dimensi121 || dimensi222) {
      message +=
        '🛠️Repair 2🛠️\n' +
        `Titik 1: ${titik121}\n` +
        `Area Kerusakan 1: ${areakerusakan121}\n` +
        `Proses Repair 1: ${prosesrepair121}\n` +
        `Dimensi 1: ${dimensi121}\n` +
        `Penyebab Kerusakan 1: ${penyebabkerusakan121}\n\n` +
        `Titik 2: ${titik222}\n` +
        `Area Kerusakan 2: ${areakerusakan222}\n` +
        `Proses Repair 2: ${prosesrepair222}\n` +
        `Dimensi 2: ${dimensi222}\n` +
        `Penyebab Kerusakan 2: ${penyebabkerusakan222}\n\n`;
    }
  
    if (titik131 || titik232 || titik333) {
      message +=
        '🛠️Repair 3🛠️\n' +
        `Titik 1: ${titik131}\n` +
        `Area Kerusakan 1: ${areakerusakan131}\n` +
        `Proses Repair 1: ${prosesrepair131}\n` +
        `Dimensi 1: ${dimensi131}\n` +
        `Penyebab Kerusakan 1: ${penyebabkerusakan131}\n\n` +
        `Titik 2: ${titik232}\n` +
        `Area Kerusakan 2: ${areakerusakan232}\n` +
        `Proses Repair 2: ${prosesrepair232}\n` +
        `Dimensi 2: ${dimensi232}\n` +
        `Penyebab Kerusakan 2: ${penyebabkerusakan232}\n\n` +
        `Titik 3: ${titik333}\n` +
        `Area Kerusakan 3: ${areakerusakan333}\n` +
        `Proses Repair 3: ${prosesrepair333}\n` +
        `Dimensi 3: ${dimensi333}\n` +
        `Penyebab Kerusakan 3: ${penyebabkerusakan333}\n\n`;
    }
  
    if (cements2000pn5252161 || solventpn5959125 || hardenerforsc2000pn5251151 || patchfabricatedpnptcbc) {
      message +=
        '🛞Sparepart🛞 \n' +
        'Cement S2000, PN : 525 2161 : ' + cements2000pn5252161 + '\n' +
        'Hardener for SC 2000, PN : 525 1151 : ' + hardenerforsc2000pn5251151 + '\n' +
        'Solvent, PN : 595 9125 : ' + solventpn5959125 + '\n' +
        'Patch fabricated, PN: PTC BC : ' + patchfabricatedpnptcbc + '\n\n' ;
    }
  
    if (rfu) {
      message += `RFU: ${rfu}\n\n`;
    }
  
    message += '🔰Terimakasih🔰';
    return message;
  }
  
  
  
