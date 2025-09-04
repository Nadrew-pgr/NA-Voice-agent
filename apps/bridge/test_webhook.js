const fetch = require('node-fetch');

async function testWebhook() {
  const payload = {
    course_id: "TEST-COURSE-001",
    chunk_id: "000001",
    started_at: Date.now(),
    text: "Ceci est un test de transcription simulée pour vérifier que le webhook n8n fonctionne correctement."
  };

  try {
    console.log('🚀 Envoi du test vers n8n...');
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch('http://localhost:5678/webhook-test/NA-Voice-Agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    
    console.log('📥 Réponse n8n:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers.raw());
    console.log('Body:', responseText);
    
    if (response.ok) {
      console.log('✅ Test réussi ! n8n a bien reçu les données.');
    } else {
      console.log('❌ Erreur HTTP:', response.status);
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error.message);
  }
}

testWebhook();
