#!/bin/bash

echo "================================"
echo "Testing Frontend Build"
echo "================================"

cd "$(dirname "$0")/frontend-react"

echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Frontend build successful!"
    echo "Build output: frontend-react/dist"
else
    echo ""
    echo "❌ Frontend build failed!"
    exit 1
fi

echo ""
echo "================================"
echo "Testing Backend Build"
echo "================================"

cd "$(dirname "$0")/backend"

echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Running build command..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Backend build successful!"
else
    echo ""
    echo "❌ Backend build failed!"
    exit 1
fi

cd "$(dirname "$0")"

echo ""
echo "================================"
echo "✅ All builds completed successfully!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Deploy backend: cd backend && vercel --prod"
echo "2. Get backend URL from Vercel"
echo "3. Update frontend .env.production with backend URL"
echo "4. Deploy frontend: cd frontend-react && vercel --prod"
echo ""
echo "See VERCEL_DEPLOYMENT.md for detailed instructions"
