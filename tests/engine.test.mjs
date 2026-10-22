import test from 'node:test';
import assert from 'node:assert/strict';
import { archetypes, questions, zodiacSign, zodiacReadings, scoreAnswers, getZodiacResult } from '../engine.js';

test('12 situational questions have a selectable, scored answer for every archetype', () => {
  assert.equal(questions.length, 12);
  assert.ok(questions.every(q => q.options.length >= 3 && q.options.length <= 4));
  const reachable = new Set(questions.flatMap(q => q.options.map(o => o.type)));
  assert.deepEqual([...reachable].sort(), archetypes.map(a => a.id).sort());
  for (const archetype of archetypes) {
    const words = (archetype.roast + ' ' + archetype.roastMore).split(/\s+/).length;
    assert.ok(words >= 150 && words <= 250, `${archetype.id}: ${words} words`);
  }
});

test('each archetype can win and empty answers produce a deterministic result', () => {
  for (const type of archetypes) {
    const answers = questions.map(q => {
      const target = q.options.findIndex(o => o.type === type.id);
      if (target >= 0) return target;
      return q.options.findIndex(o => o.type !== type.id);
    });
    assert.equal(scoreAnswers(answers).archetype.id, type.id);
  }
  const tieA = scoreAnswers([]), tieB = scoreAnswers([]);
  assert.equal(tieA.archetype.id, archetypes[0].id);
  assert.deepEqual(tieA, tieB);
});

test('all zodiac signs resolve at their date boundaries', () => {
  const dates = {
    'Овен':'2026-03-21','Телец':'2026-04-20','Близнецы':'2026-05-21','Рак':'2026-06-21',
    'Лев':'2026-07-23','Дева':'2026-08-23','Весы':'2026-09-23','Скорпион':'2026-10-23',
    'Стрелец':'2026-11-22','Козерог':'2026-12-22','Водолей':'2026-01-20','Рыбы':'2026-02-19'
  };
  for (const [sign,date] of Object.entries(dates)) assert.equal(zodiacSign(date), sign);
  assert.equal(Object.keys(zodiacReadings).length,12);
  assert.equal(zodiacSign(''),null);
  assert.equal(zodiacSign('2026-02-30'),null);
  assert.equal(getZodiacResult(null,'chaos'),null);
  assert.match(getZodiacResult('Дева','perfectionist'),/Перфекционист с огнемётом/);
});

test('partial, invalid and repeated answers never produce an undefined archetype', () => {
  for (const answers of [[],[null],[99],Array(12).fill(0),Array(12).fill(null)]) {
    assert.ok(archetypes.some(a => a.id === scoreAnswers(answers).archetype.id));
  }
});
