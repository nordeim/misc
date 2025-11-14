$ npx create-next-app@14.2.33 limeaura-styleguide --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

$ npm install @radix-ui/react-label@2 @radix-ui/react-select@2 @radix-ui/react-slot@1 lucide-react react-hook-form@7 tailwind-merge@2

$ npm list
├── @types/node@20.19.25
├── @types/react-dom@18.3.7
├── @types/react@18.3.26
├── eslint-config-next@14.2.33
├── eslint@8.57.1
├── next@14.2.33
├── postcss@8.5.6
├── react-dom@18.3.1
├── react@18.3.1
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
    "react": "^18",
    "react-dom": "^18",
    "next": "14.2.33"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.33"
  }
}
