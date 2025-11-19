import * as XLSX from 'xlsx';
import { getLocalGroups, getLocalExpenses } from './localStore';

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportAllToCSV() {
  const groups = getLocalGroups();
  const expenses = getLocalExpenses();

  // Groups CSV
  const groupRows = [['id','name','owner','members','description','createdAt']];
  groups.forEach(g => groupRows.push([g.id, g.name, g.owner, (g.members || []).join('|'), g.description || '', g.createdAt]));
  const groupCsv = groupRows.map(r => r.map(cell => `"${String(cell ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
  const groupBlob = new Blob([groupCsv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob('splitclone-groups.csv', groupBlob);

  // Expenses CSV
  const expRows = [['id','groupId','amount','payerId','participants','description','createdAt']];
  expenses.forEach(e => expRows.push([e.id, e.groupId, e.amount, e.payerId, (e.participants || []).join('|'), e.description || '', e.createdAt]));
  const expCsv = expRows.map(r => r.map(cell => `"${String(cell ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
  const expBlob = new Blob([expCsv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob('splitclone-expenses.csv', expBlob);
}

export function exportGroupToXlsx(groupId) {
  const groups = getLocalGroups();
  const group = groups.find(g => g.id === groupId);
  if (!group) throw new Error('Group not found');
  const expenses = getLocalExpenses(groupId);

  const wb = XLSX.utils.book_new();

  const gSheet = XLSX.utils.json_to_sheet([group]);
  XLSX.utils.book_append_sheet(wb, gSheet, 'Group');

  const members = (group.members || []).map(m => ({ member: m }));
  const mSheet = XLSX.utils.json_to_sheet(members);
  XLSX.utils.book_append_sheet(wb, mSheet, 'Members');

  const eSheet = XLSX.utils.json_to_sheet(expenses);
  XLSX.utils.book_append_sheet(wb, eSheet, 'Expenses');

  XLSX.writeFile(wb, `splitclone-group-${groupId}.xlsx`);
}

export function exportAllToXlsx() {
  const groups = getLocalGroups();
  const expenses = getLocalExpenses();
  const wb = XLSX.utils.book_new();

  const gSheet = XLSX.utils.json_to_sheet(groups);
  XLSX.utils.book_append_sheet(wb, gSheet, 'Groups');

  const members = [];
  groups.forEach(g => {
    (g.members || []).forEach(m => members.push({ groupId: g.id, member: m }));
  });
  const mSheet = XLSX.utils.json_to_sheet(members);
  XLSX.utils.book_append_sheet(wb, mSheet, 'Members');

  const eSheet = XLSX.utils.json_to_sheet(expenses);
  XLSX.utils.book_append_sheet(wb, eSheet, 'Expenses');

  XLSX.writeFile(wb, `splitclone-all-${Date.now()}.xlsx`);
}
