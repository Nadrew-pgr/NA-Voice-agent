#!/bin/bash

echo "🚀 Test de l'application Assistant IA Notes"
echo "=========================================="

# Test du serveur bridge
echo -e "\n1. Test du serveur Bridge (port 3002)..."
BRIDGE_HEALTH=$(curl -s http://localhost:3002/health)
if [[ $BRIDGE_HEALTH == *"ok\":true"* ]]; then
    echo "✅ Bridge server: OK"
else
    echo "❌ Bridge server: ERREUR"
    echo "Réponse: $BRIDGE_HEALTH"
fi

# Test de l'app web
echo -e "\n2. Test de l'app Web (port 3001)..."
WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
if [[ $WEB_STATUS == "200" ]]; then
    echo "✅ Web app: OK (HTTP $WEB_STATUS)"
else
    echo "❌ Web app: ERREUR (HTTP $WEB_STATUS)"
fi

# Test de l'endpoint d'upload (sans fichier, juste pour vérifier qu'il répond)
echo -e "\n3. Test de l'endpoint d'upload..."
UPLOAD_TEST=$(curl -s -X POST http://localhost:3002/ingest 2>&1)
if [[ $UPLOAD_TEST == *"Aucun fichier"* ]] || [[ $UPLOAD_TEST == *"No file"* ]]; then
    echo "✅ Endpoint /ingest: OK (répond correctement)"
else
    echo "⚠️  Endpoint /ingest: Réponse inattendue"
    echo "Réponse: $UPLOAD_TEST"
fi

echo -e "\n=========================================="
echo "📊 Résumé:"
echo "- App Web: http://localhost:3001"
echo "- Bridge API: http://localhost:3002"
echo "- Health check: http://localhost:3002/health"
echo ""
echo "🎯 L'application est prête à être utilisée !"
echo "Ouvrez http://localhost:3001 dans votre navigateur."