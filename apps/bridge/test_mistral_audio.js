const { default: MistralClient } = require('@mistralai/mistralai');

console.log('Test de l\'API Mistral Audio...');

try {
  const client = new MistralClient('test-key');
  console.log('Client créé avec succès');
  
  // Vérifier les propriétés disponibles
  console.log('Propriétés du client:', Object.keys(client));
  
  // Vérifier si audio existe
  if (client.audio) {
    console.log('Propriété audio trouvée:', Object.keys(client.audio));
    
    if (client.audio.transcriptions) {
      console.log('Propriété transcriptions trouvée:', Object.keys(client.audio.transcriptions));
    } else {
      console.log('Propriété transcriptions NON trouvée');
    }
  } else {
    console.log('Propriété audio NON trouvée');
  }
  
} catch (error) {
  console.error('Erreur:', error.message);
}
