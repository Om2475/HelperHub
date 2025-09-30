import fs from 'fs';

const data = JSON.parse(fs.readFileSync('helperhub-7654e-default-rtdb-export(1).json', 'utf8'));

if (!data.users) {
  data.users = {};
}
if (!data.users.jobSeeker) {
  data.users.jobSeeker = {};
}

for (const key in data) {
  if (key.startsWith('user') && !isNaN(key.slice(4))) {
    data.users.jobSeeker[key] = data[key];
    delete data[key];
  }
}

fs.writeFileSync('helperhub-7654e-default-rtdb-export(1).json', JSON.stringify(data, null, 2));
console.log('Done');
