#!/bin/bash

# Install Swagger package
echo "Installing @nestjs/swagger..."
npm install --save @nestjs/swagger

# Build the project
echo "Building the project..."
npm run build

echo "Setup complete! You can now:"
echo "1. Visit http://localhost:3030/api-docs to see the Swagger UI"
echo "2. Visit http://localhost:3030/api-docs-json to get the OpenAPI JSON"
