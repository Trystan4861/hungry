export function findIndexById(whatID, where) {
  return where.findIndex(item => item.id === whatID);
}