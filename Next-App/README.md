# Create Next.js app with specific version
$ npx create-next-app@14.2.33 limeaura-styleguide --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install exact dependency versions from reference stack
$ npm install @radix-ui/react-label@2 @radix-ui/react-select@2 @radix-ui/react-slot@1 lucide-react react-hook-form@7 tailwind-merge@2

# Install dev dependencies
$ npm install -D @types/node@20 @types/react@18 @types/react-dom@18 postcss@8 postcss-preset-mantine@1 postcss-simple-vars@7

$ npm list
├── @radix-ui/react-label@2.1.8
├── @radix-ui/react-select@2.2.6
├── @radix-ui/react-slot@1.2.4
├── @types/node@20.19.25
├── @types/react-dom@18.3.7
├── @types/react@18.3.26
├── eslint-config-next@14.2.33
├── eslint@8.57.1
├── lucide-react@0.553.0
├── next@14.2.33
├── postcss-preset-mantine@1.18.0
├── postcss-simple-vars@7.0.1
├── postcss@8.5.6
├── react-dom@18.3.1
├── react-hook-form@7.66.0
├── react@18.3.1
├── tailwind-merge@2.6.0
├── tailwindcss@3.4.18
└── typescript@5.9.3


$ cat package.json 
{
  "name": "limeaura-styleguide",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.4",
    "lucide-react": "^0.553.0",
    "next": "14.2.33",
    "react": "^18",
    "react-dom": "^18",
    "react-hook-form": "^7.66.0",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.19.25",
    "@types/react": "^18.3.26",
    "@types/react-dom": "^18.3.7",
    "eslint": "^8",
    "eslint-config-next": "14.2.33",
    "postcss": "^8.5.6",
    "postcss-preset-mantine": "^1.18.0",
    "postcss-simple-vars": "^7.0.1",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
