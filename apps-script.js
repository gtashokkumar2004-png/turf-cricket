/**
 * Turf Cricket — Google Apps Script backend
 * Paste this entire file into the Apps Script editor (script.google.com).
 * Deploy as a Web App (Execute as: Me, Access: Anyone) and copy the URL
 * into the Turf Cricket app's Setup → Sync to Google Sheets URL field.
 */

var SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId()

/** Entry point for all POST requests from the PWA. */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents)
    var ss = SpreadsheetApp.openById(SHEET_ID)

    if (data.type === 'match_complete') {
      writeMatchSummary(ss, data)
    } else {
      writeBall(ss, data)
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

/**
 * Write a single ball delivery to the "Balls" sheet.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {Object} data  Ball payload from PWA
 */
function writeBall(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Balls', [
    'Timestamp', 'MatchId', 'InningsNo', 'Over', 'Ball',
    'Batsman', 'Bowler', 'Runs', 'Extras', 'Wicket', 'WicketType', 'Fielder',
  ])

  sheet.appendRow([
    new Date().toISOString(),
    data.matchId || '',
    data.inningsNo || '',
    data.over !== undefined ? data.over + 1 : '',
    data.ball || '',
    data.batsman || '',
    data.bowler || '',
    data.runs !== undefined ? data.runs : '',
    data.extras || '',
    data.wicket ? 'Y' : 'N',
    data.wicketType || '',
    data.fielder || '',
  ])
}

/**
 * Write a match summary row to the "Matches" sheet.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {Object} data  Match object from PWA
 */
function writeMatchSummary(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Matches', [
    'MatchId', 'Date', 'Team1', 'Team2', 'Overs',
    'Inn1_Team', 'Inn1_Runs', 'Inn1_Wickets',
    'Inn2_Team', 'Inn2_Runs', 'Inn2_Wickets',
    'Winner', 'Margin', 'TossWinner', 'BattingFirst',
  ])

  var inn0 = data.innings && data.innings[0] ? data.innings[0] : {}
  var inn1 = data.innings && data.innings[1] ? data.innings[1] : {}
  var s0 = calcStats(inn0.balls || [])
  var s1 = calcStats(inn1.balls || [])

  sheet.appendRow([
    data.id || '',
    data.date || '',
    data.team1 || '',
    data.team2 || '',
    data.overs || '',
    inn0.battingTeam || '',
    s0.runs,
    s0.wickets,
    inn1.battingTeam || '',
    s1.runs,
    s1.wickets,
    data.winner || '',
    data.margin || '',
    data.tossWinner || '',
    data.battingFirst || '',
  ])
}

/** Return or create a sheet with header row. */
function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name)
  if (!sheet) {
    sheet = ss.insertSheet(name)
    sheet.appendRow(headers)
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold')
  }
  return sheet
}

/** Minimal stats calculation for the summary row. */
function calcStats(balls) {
  var runs = 0, wickets = 0, legalBalls = 0
  for (var i = 0; i < balls.length; i++) {
    var b = balls[i]
    runs += b.runs || 0
    if (b.extras === 'Wide') runs += 1
    if (b.extras === 'No Ball') runs += 1
    if (b.wicket) wickets++
    if (b.extras !== 'Wide' && b.extras !== 'No Ball') legalBalls++
  }
  return { runs: runs, wickets: wickets, legalBalls: legalBalls }
}

/** Simple test — run manually from Apps Script editor to verify setup. */
function testSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = getOrCreateSheet(ss, 'Balls', [
    'Timestamp','MatchId','InningsNo','Over','Ball',
    'Batsman','Bowler','Runs','Extras','Wicket','WicketType','Fielder',
  ])
  Logger.log('Balls sheet rows: ' + sheet.getLastRow())
}
