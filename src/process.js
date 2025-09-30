import fs from 'fs';

const data = JSON.parse(fs.readFileSync('helperhub-7654e-default-rtdb-export(1).json', 'utf8'));

function cleanSubServices(obj) {
  if (obj && obj.profile && Array.isArray(obj.profile.selectedSubServices)) {
    obj.profile.selectedSubServices = obj.profile.selectedSubServices.slice(2);
  }
}

for (const key in data) {
  if (key.startsWith('user') && !isNaN(key.slice(4))) {
    cleanSubServices(data[key]);
  }
}

if (data.users) {
  if (data.users.jobSeeker) {
    for (const uid in data.users.jobSeeker) {
      if (data.users.jobSeeker[uid].profile) {
        cleanSubServices(data.users.jobSeeker[uid]);
      }
    }
  }
  if (data.users.employer) {
    for (const uid in data.users.employer) {
      if (data.users.employer[uid].profile) {
        cleanSubServices(data.users.employer[uid]);
      }
    }
  }
}

fs.writeFileSync('helperhub-7654e-default-rtdb-export(1).json', JSON.stringify(data, null, 2));
console.log('Done');
