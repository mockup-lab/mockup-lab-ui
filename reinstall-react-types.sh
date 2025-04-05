#!/bin/bash
# Script to reinstall React types

# Remove node_modules and package-lock.json
rm -rf node_modules
rm -f package-lock.json

# Reinstall dependencies
npm install

# Specifically reinstall React types
npm install --save-dev @types/react @types/react-dom

echo "React types reinstalled successfully!"