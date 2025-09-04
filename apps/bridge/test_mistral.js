const MistralClient = require('@mistralai/mistralai');

console.log('MistralClient:', typeof MistralClient);
console.log('MistralClient constructor:', MistralClient);
console.log('MistralClient.prototype:', MistralClient.prototype);

// Essayer de créer une instance
try {
  const client = new MistralClient('test-key');
  console.log('Client créé:', client);
  console.log('Méthodes disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
} catch (error) {
  console.error('Erreur création client:', error.message);
}
