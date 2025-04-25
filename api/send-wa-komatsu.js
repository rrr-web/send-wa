export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const data = req.body;
    const groupids = ['6285222707916-1558930545','6281273133989-1556927028'];
    // const groupIds = ['6282236924872'];

    const message = formatMessage(data);
  
    try {
      const response = await fetch('https://tegal.wablas.com/api/v2/send-message', {
        method: 'POST',
        headers: {
          'Authorization': 'rfxGFTZNzK6brC9JhC2u9vUWGKLqiLJrN13Ugo2uyBA9C7bQUGAndAFxz9rJipBp.QogfE4TK',
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
  
    
    function formatMessage(data) {
      const get = (key) => (data[key] || '').toString();
      return `🟦 🟦 🟦
    
    Unit Komatsu Mechanic Report
    
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
        console.log('Formatted bullet list:\n' + result);
        return result;
    }
    
