export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.WABLAS_API_TOKEN) {
      return res.status(500).json({ error: 'API token missing' });
    }
    
    const data = req.body;
    const groupIds = ['120363144656588701'];
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
        tanggal, nowo, unit, lokasi, operator, hoursmeters, lokasipengerjaan, problem, tyresize, action, 
        posisid1, jeniskerusakand1, penyebabkerusakand1, brandd1, patternd1, snd1, rtdd1, tyrestatusd1, tubestatusd1, flapstatusd1, 
        posisim1, brandm1, patternm1, snm1, psim1, rtdm1, tyrestatusm1, tubestatusm1, flapstatusm1, 
        posisid2, jeniskerusakand2, penyebabkerusakand2, brandd2, patternd2, snd2, rtdd2, tyrestatusd2, tubestatusd2, flapstatusd2, 
        posisim2, brandm2, patternm2, snm2, psim2, rtdm2, tyrestatusm2, tubestatusm2, flapstatusm2, 
        delay, startpengerjaan, finishpengerjaan, status, pendingjob, manpower, supervisor
    } = data;
  
    let message =
    '🟦 🟦 🟦\n\n'+
    '🛞Tyre Mechanic Report🛞\n\n' +
    '🗓️Tanggal: ' + tanggal + '\n' +
    'No WO: ' + nowo + '\n' +
    'Unit: ' + unit + '\n' +
    'Lokasi: ' + lokasi + '\n' +
    'Operator: ' + operator + '\n' +
    'Hours Meters: ' + hoursmeters + '\n\n' +
    'Lokasi Breakdown: ' +lokasipengerjaan+ '\n'+
    'Problem: \n' + bulletList(problem) + '\n'+
    'Tyre Size: ' + tyresize +  '\n\n'+
    'Tindak Lanjut Perbaikan:\n' + bulletList(action) + '\n\n'; 
  
    if (posisid1 || jeniskerusakand1 || penyebabkerusakand1 || brandd1 || patternd1 || snd1 || rtdd1 || tyrestatusd1 || tubestatusd1 || flapstatusd1) {
        message +=
            '🛠️Dismounting 1🛠️ \n' +
            'Posisi : ' + posisid1 + '\n' +
            'Jenis Kerusakan : ' + jeniskerusakand1 + '\n' +
            'Penyebab Kerusakan : ' + penyebabkerusakand1 + '\n' +
            'Tyre Brand : ' + brandd1 + '\n' +
            'Pattern Brand : ' + patternd1 + '\n' +
            'SN : ' + snd1 + '\n' +
            'RTD : ' + rtdd1 + '\n' +
            'Tyre Status : ' + tyrestatusd1 + '\n' +
            'Tube Status : ' + tubestatusd1 + '\n' +
            'Flap Status : ' + flapstatusd1 + '\n\n';
    }
    
    // Mounting 1
    if (posisim1 || brandm1 || patternm1 || snm1 || rtdm1 || psim1 || tyrestatusm1 || tubestatusm1 || flapstatusm1) {
        message +=
            '🛞Mounting 1🛞 \n' +
            'Posisi : ' + posisim1 + '\n' +
            'Tyre Brand : ' + brandm1 + '\n' +
            'Pattern Brand : ' + patternm1 + '\n' +
            'SN : ' + snm1 + '\n' +
            'PSI : ' + psim1 + '\n' +
            'RTD : ' + rtdm1 + '\n' +
            'Tyre Status : ' + tyrestatusm1 + '\n' +
            'Tube Status : ' + tubestatusm1 + '\n' +
            'Flap Status : ' + flapstatusm1 + '\n\n';
    }
    
    // Dismounting 2
    if (posisid2 || jeniskerusakand2 || penyebabkerusakand2 || brandd2 || patternd2 || snd2 || rtdd2 || tyrestatusd2 || tubestatusd2 || flapstatusd2) {
        message +=
            '🛠️Dismounting 2🛠️\n' +
            'Posisi : ' + posisid2 + '\n' +
            'Jenis Kerusakan : ' + jeniskerusakand2 + '\n' +
            'Penyebab Kerusakan : ' + penyebabkerusakand2 + '\n' +
            'Tyre Brand : ' + brandd2 + '\n' +
            'Pattern Brand : ' + patternd2 + '\n' +
            'SN:' + snd2 + '\n' +
            'RTD:' + rtdd2 + '\n' +
            'Tyre Status : ' + tyrestatusd2 + '\n' +
            'Tube Status : ' + tubestatusd2 + '\n' +
            'Flap Status : ' + flapstatusd2 + '\n\n';
    }
    
    // Mounting 2
    if (posisim2 || brandm2 || patternm2 || snm2 || rtdm2 || psim2 || tyrestatusm2 || tubestatusm2 || flapstatusm2) {
        message +=
            '🛞Mounting 2🛞 \n' +
            'Posisi : ' + posisim2 + '\n' +
            'Tyre Brand :' + brandm2 + '\n' +
            'Pattern Brand : ' + patternm2 + '\n' +
            'SN:' + snm2 + '\n' +
            'PSI : ' + psim2 + '\n' +
            'RTD:' + rtdm2 + '\n' +
            'Tyre Status :' + tyrestatusm2 + '\n' +
            'Tube Status :' + tubestatusm2 + '\n' +
            'Flap Status :' + flapstatusm2 + '\n\n';
    }
        // Include "Delay" only if it's not null or empty
        if (delay && delay.trim() !== '') {
            message +=
                'Delay:\n' + bulletList(delay) + '\n\n';
        } else {
            // If "Delay" is excluded, add a new line for formatting
            message += '\n';
        }
            message +=
            'Start Pengerjaan: ' + startpengerjaan + '\n' +
            'Finish Pekerjaan: ' + finishpengerjaan + '\n' +
            'Status: ' + status + '\n\n';
    
        if (pendingjob && pendingjob.trim() !== '') {
            message += 'Pending Job:\n' + bulletList(pendingjob) + '\n\n';
        } else {
            // If "Pending Job" is excluded, add a new line for formatting
            message += '\n';
        }
        message +=
            'Man Power:\n' + bulletList(manpower) + '\n\n' +
            'Supervisor:\n' + supervisor + '\n\n' +
            '🔰Terimakasih🔰';

    return message;
  }
  
  function bulletList(text) {
    if (!text) return '• -';
    
    const lines = text
      .replace(/\r\n|\r/g, '\n')        // normalisasi newline
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');
  
    if (lines.length === 0) return '• -';
  
    const result = lines.map(line => '• ' + line).join('\n');
    return result;
  }
  
