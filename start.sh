#!/bin/bash

echo "🔍 Kollar TypeScript-fel..."

# Kolla backend
echo "📦 Backend:"
cd backend && npx tsc --noEmit 2>&1 | head -20
if [ $? -eq 0 ]; then echo "✅ Inga fel"; fi

# Kolla frontend
echo ""
echo "🎨 Frontend:"
cd ../frontend && npx tsc --noEmit 2>&1 | head -20
if [ $? -eq 0 ]; then echo "✅ Inga fel"; fi

echo ""
echo "🚀 Startar servrar..."
echo "💡 HMR är aktiverat - ändringar laddas automatiskt!"
echo ""

# Döda gamla processer
lsof -ti:3000,5173 | xargs kill -9 2>/dev/null

# Starta backend i bakgrunden med bättre output
cd ../backend && npm run start:dev 2>&1 | sed 's/^/[backend] /' &
BACKEND_PID=$!

# Vänta på att backend startar
sleep 2

# Starta frontend (förgrund)
cd ../frontend && npm run dev 2>&1 | sed 's/^/[frontend] /'

# Cleanup vid Ctrl+C
trap "kill $BACKEND_PID 2>/dev/null" EXIT
