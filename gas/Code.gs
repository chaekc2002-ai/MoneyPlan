const SESSION_SECONDS = 21600;
const STUDENT_HEADERS = ['StudentID', 'Nickname', 'PasswordHash', 'CreatedAt'];
const LOG_HEADERS = ['RecordID', 'StudentID', 'Nickname', 'Date', 'Type', 'Amount', 'Description', 'Timestamp'];

function doPost(e) {
  try {
    const request = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    switch (request.action) {
      case 'login': return login(request);
      case 'get': return getLogs(request);
      case 'add': return addLog(request);
      case 'edit': return editLog(request);
      case 'delete': return deleteLog(request);
      default: return json({ status: 'error', message: '지원하지 않는 요청입니다.' });
    }
  } catch (error) {
    return json({ status: 'error', message: error.message || '요청을 처리하지 못했습니다.' });
  }
}

function doGet() {
  return json({ status: 'error', message: 'POST 요청만 사용할 수 있습니다.' });
}

function login(request) {
  const nickname = String(request.nickname || '').trim();
  const passwordHash = String(request.passwordHash || '');
  if (!nickname || !passwordHash) return json({ status: 'error', message: '닉네임과 비밀번호를 입력해 주세요.' });

  const students = ensureStudentSheet();
  const existing = findStudent(students, nickname);
  let studentId;
  if (existing) {
    if (existing.passwordHash !== passwordHash) {
      return json({ status: 'error', message: '닉네임 또는 비밀번호가 올바르지 않습니다.' });
    }
    studentId = existing.studentId;
  } else {
    studentId = 'stu-' + Utilities.getUuid();
    students.appendRow([studentId, nickname, passwordHash, new Date()]);
  }

  const token = Utilities.getUuid();
  CacheService.getScriptCache().put('session:' + token, studentId, SESSION_SECONDS);
  return json({ status: 'success', user: { id: studentId, nickname: nickname, token: token } });
}

function getLogs(request) {
  const student = requireStudent(request);
  const logs = ensureLogSheet();
  const lastRow = logs.getLastRow();
  if (lastRow < 2) return json({ status: 'success', logs: [] });

  const values = logs.getRange(2, 1, lastRow - 1, LOG_HEADERS.length).getValues();
  const timezone = getSpreadsheet().getSpreadsheetTimeZone();
  const result = values
    .filter((row) => String(row[1]) === student.studentId)
    .map((row) => ({
      id: String(row[0]),
      studentId: String(row[1]),
      date: formatDate(row[3], timezone),
      type: String(row[4]),
      amount: Number(row[5]),
      description: String(row[6]),
    }));
  return json({ status: 'success', logs: result });
}

function addLog(request) {
  const student = requireStudent(request);
  const log = request.log || {};
  validateLog(log);
  if (String(log.studentId) !== student.studentId) throw new Error('학생 정보가 일치하지 않습니다.');

  const logs = ensureLogSheet();
  if (findLogRow(logs, log.id, student.studentId) !== -1) {
    throw new Error('이미 저장된 기록입니다.');
  }
  logs.appendRow([log.id, student.studentId, student.nickname, log.date, log.type, Number(log.amount), log.description, new Date()]);
  return json({ status: 'success' });
}

function editLog(request) {
  const student = requireStudent(request);
  const log = request.log || {};
  validateLog(log);
  if (String(log.studentId) !== student.studentId) throw new Error('학생 정보가 일치하지 않습니다.');

  const logs = ensureLogSheet();
  const row = findLogRow(logs, log.id, student.studentId);
  if (row === -1) throw new Error('수정할 기록을 찾지 못했습니다.');
  logs.getRange(row, 4, 1, 4).setValues([[log.date, log.type, Number(log.amount), log.description]]);
  return json({ status: 'success' });
}

function deleteLog(request) {
  const student = requireStudent(request);
  const id = String(request.id || '');
  if (!id) throw new Error('기록 ID가 없습니다.');

  const logs = ensureLogSheet();
  const row = findLogRow(logs, id, student.studentId);
  if (row === -1) throw new Error('삭제할 기록을 찾지 못했습니다.');
  logs.deleteRow(row);
  return json({ status: 'success' });
}

function requireStudent(request) {
  const token = String(request.token || '');
  const requestedId = String(request.studentId || (request.log && request.log.studentId) || '');
  const studentId = CacheService.getScriptCache().get('session:' + token);
  if (!studentId || studentId !== requestedId) throw new Error('로그인 시간이 만료되었습니다. 다시 로그인해 주세요.');

  const student = findStudentById(ensureStudentSheet(), studentId);
  if (!student) throw new Error('학생 정보를 찾지 못했습니다.');
  return student;
}

function validateLog(log) {
  if (!log.id || !log.date || !log.type || !log.description || !isFinite(Number(log.amount))) {
    throw new Error('기록 값이 올바르지 않습니다.');
  }
  if (['income', 'expense'].indexOf(String(log.type)) === -1) {
    throw new Error('기록 유형이 올바르지 않습니다.');
  }
}

function getSpreadsheet() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  return spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();
}

function ensureStudentSheet() {
  const spreadsheet = getSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Students') || spreadsheet.insertSheet('Students');
  if (sheet.getLastRow() === 0) sheet.appendRow(STUDENT_HEADERS);
  return sheet;
}

function ensureLogSheet() {
  const spreadsheet = getSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Logs') || spreadsheet.insertSheet('Logs');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(LOG_HEADERS);
    return sheet;
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  if (headers.indexOf('StudentID') === -1) {
    // 기존 [ID, Date, Type, Amount, Description, Timestamp] 행을 보존하면서 두 열을 삽입한다.
    sheet.insertColumnsAfter(1, 2);
    sheet.getRange(1, 1, 1, LOG_HEADERS.length).setValues([LOG_HEADERS]);
  }
  return sheet;
}

function findStudent(sheet, nickname) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const rows = sheet.getRange(2, 1, lastRow - 1, STUDENT_HEADERS.length).getValues();
  const found = rows.find((row) => String(row[1]) === nickname);
  return found ? { studentId: String(found[0]), nickname: String(found[1]), passwordHash: String(found[2]) } : null;
}

function findStudentById(sheet, studentId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const rows = sheet.getRange(2, 1, lastRow - 1, STUDENT_HEADERS.length).getValues();
  const found = rows.find((row) => String(row[0]) === studentId);
  return found ? { studentId: String(found[0]), nickname: String(found[1]), passwordHash: String(found[2]) } : null;
}

function findLogRow(sheet, id, studentId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const rows = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  const index = rows.findIndex((row) => String(row[0]) === String(id) && String(row[1]) === String(studentId));
  return index === -1 ? -1 : index + 2;
}

function formatDate(value, timezone) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, timezone, 'yyyy-MM-dd');
  }
  return String(value);
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
