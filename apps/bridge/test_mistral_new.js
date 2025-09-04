const mistralModule = require('@mistralai/mistralai');

console.log('Test de la nouvelle version Mistral 1.10.0...');

try {
  const client = new mistralModule.Mistral('test-key');
  console.log('✅ Client créé avec succès');
  
  // Vérifier les propriétés disponibles
  console.log('Propriétés du client:', Object.keys(client));
  
  // Vérifier si audio existe
  if (client.audio) {
    console.log('✅ Propriété audio trouvée:', Object.keys(client.audio));
    
    if (client.audio.transcriptions) {
      console.log('✅ Propriété transcriptions trouvée:', Object.keys(client.audio.transcriptions));
      
      if (client.audio.transcriptions.complete) {
        console.log('✅ Méthode complete trouvée !');
      } else {
        console.log('❌ Méthode complete NON trouvée');
      }
    } else {
      console.log('❌ Propriété transcriptions NON trouvée');
    }
  } else {
    console.log('❌ Propriété audio NON trouvée');
  }
  
} catch (error) {
  console.error('Erreur:', error.message);
}
