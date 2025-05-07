export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.WABLAS_API_TOKEN) {
      return res.status(500).json({ error: 'API token missing' });
    }
    
    const data = req.body;
    const groupIds = ['6285222707916-1558930545','120363266047797099'];
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

     async function retryFetch(url, options, retries = 3, delay = 500) {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, options);
        if (res.ok) return res;
        console.warn(`Retry ${i + 1}: Response not ok (${res.status})`);
      } catch (err) {
        console.warn(`Retry ${i + 1}: Fetch error`, err.message);
        if (i === retries - 1) throw err;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
    
    function formatMessage(data) {
      const get = (key) => (data[key] || '').toString();
      return `🟦 🟦 🟦
    
    Unit Liebherr Mechanic Report
    
    Unit: ${get('unit')}
    Operator: ${get('operator')}
    Lokasi: ${get('lokasi')}
    Hours Meters: ${get('hoursmeters')}
    Start BD:
    Tanggal: ${get('tanggalbd')}
    Jam: ${get('jambd')}
    Pembuat Laporan: ${get('pembuatlaporan')}
    
    ⚠️Problem:
    ${bulletList(get('problem'))}
    
    Hasil Pengecekan:
    ${bulletList(get('hasilpengecekan'))}
    
    🛠️Tindak Lanjut Perbaikan:
    ${bulletList(get('action'))}
    
    ⚙️ Part yang Digunakan:
    ${bulletList(get('part'))}
    
    Delay:
    ${bulletList(get('delay'))}
    
    Start Pengerjaan:
    Tanggal: ${get('tanggalpengerjaan')}
    Jam: ${get('jampengerjaan')}
    
    Finish Pengerjaan:
    Tanggal: ${get('tanggalselesai')}
    Jam: ${get('jamselesai')}
    
    Status: ${get('status')}
    
    Pending Job:
    ${bulletList(get('pendingjob'))}

    Backlog:
    ${bulletList(get('backlog'))}
        
    Man Power:
    ${bulletList(get('manpower'))}
    
    Supervisor:
    ${get('supervisor')}
    
    🔰Terimakasih🔰`;
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
    
