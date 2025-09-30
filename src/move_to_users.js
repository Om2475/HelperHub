import fs from 'fs';

const data = JSON.parse(fs.readFileSync('helperhub-7654e-default-rtdb-export(1).json', 'utf8'));

for (const key in data.users.jobSeeker) {
  if (key.startsWith('user') && !isNaN(key.slice(4))) {
    data.users[key] = data.users.jobSeeker[key];
    delete data.users.jobSeeker[key];
  }
}

fs.writeFileSync('helperhub-7654e-default-rtdb-export(1).json', JSON.stringify(data, null, 2));
console.log('Done');
