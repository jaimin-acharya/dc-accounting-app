const fs = require('fs');
const path = require('path');

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(source)) return;
  
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  for (const file of files) {
    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);
    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
    }
  }
}

// Copy public to .next/standalone/public
console.log('Copying public directory to standalone...');
copyFolderRecursiveSync(
  path.join(__dirname, '../public'),
  path.join(__dirname, '../.next/standalone/public')
);

// Copy .next/static to .next/standalone/.next/static
console.log('Copying .next/static directory to standalone...');
copyFolderRecursiveSync(
  path.join(__dirname, '../.next/static'),
  path.join(__dirname, '../.next/standalone/.next/static')
);

console.log('Static assets copied successfully!');
