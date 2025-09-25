class EmployeeManager {
   constructor() {
    this.employees = []; 
  }

  
  add({ name, id }) {
    if (!name || !id) throw new Error('Name and ID are required.');
    const exists = this.employees.some(e => e.id.toLowerCase() === id.toLowerCase());
    if (exists) throw new Error(`Employee with ID "${id}" already exists.`);
    this.employees.push({ name, id });
  }

  
  list() {
    return [...this.employees];
  }

 
  findById(id) {
    return this.employees.find(e => e.id.toLowerCase() === id.toLowerCase()) || null;
  }

  
  removeById(id) {
    const idx = this.employees.findIndex(e => e.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) return false;
    this.employees.splice(idx, 1);
    return true;
  }
}
removeById(id) {
    const idx = this.employees.findIndex(e => e.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) return false;
    this.employees.splice(idx, 1);
    return true;
  }
}

module.exports = EmployeeManager;

module.exports = EmployeeManager;
