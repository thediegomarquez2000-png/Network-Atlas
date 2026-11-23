import os
import sys, os
from playwright.sync_api import sync_playwright
url = 'file://' + os.path.abspath(sys.argv[1])
shots = sys.argv[2]
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME','/usr/bin/google-chrome'), args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1360, 'height': 900})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' else None)
    pg.goto(url); pg.wait_for_timeout(400)
    pg.screenshot(path=f'{shots}/01-home.png')
    # enable same-day checks so the full loop can be tested in one sitting
    pg.click('[data-view="settings"]'); pg.wait_for_timeout(200)
    pg.click('[data-pref="sameDay"]'); pg.screenshot(path=f'{shots}/02-settings.png', full_page=True)
    pg.click('[data-pref="minWords"][data-val="5"]')
    # lesson 1
    pg.click('[data-view="home"]'); pg.click('[data-action="continue"]'); pg.wait_for_timeout(200)
    data = pg.evaluate('({lab:ATLAS_LESSONS.n001.lab.answer, quiz:ATLAS_LESSONS.n001.quiz})')
    # wrong answer first on lab -> hint
    wrong = [i for i in range(4) if i != data['lab']][0]
    pg.click(f'[data-lab="{wrong}"]'); pg.wait_for_timeout(100)
    assert pg.locator('.feedback.hint').count() == 1, 'hint missing'
    pg.screenshot(path=f'{shots}/03-hint.png', full_page=True)
    pg.click(f'[data-lab="{data["lab"]}"]')
    # quiz: questions are shuffled; read each question text to find its answer
    for i in range(3):
        qtext = pg.locator('.question-card .q-title').nth(i).inner_text()
        ans = next(q['answer'] for q in data['quiz'] if q['q'][:30] in qtext)
        pg.click(f'[data-question="{i}"][data-option="{ans}"]')
    # show it: pick mode
    pg.click('[data-show-mode="pick"]')
    oks = pg.evaluate('ATLAS_LESSONS.n001.key')
    cards = pg.locator('.pick-card')
    for i in range(cards.count()):
        if any(k[:25] in cards.nth(i).inner_text() for k in oks):
            cards.nth(i).click()
    pg.click('[data-action="check-pick"]'); pg.wait_for_timeout(100)
    pg.screenshot(path=f'{shots}/04-lesson-done.png', full_page=True)
    assert not pg.locator('[data-action="finish"]').is_disabled(), 'finish disabled'
    pg.click('[data-action="finish"]'); pg.wait_for_timeout(200)
    assert 'Bits' in pg.locator('h1').first.inner_text(), 'did not advance to lesson 2'
    # type mode on lesson 2 with too few words
    pg.click('[data-show-mode="type"]'); pg.fill('#teach-input', 'bits'); pg.click('[data-action="check-teach"]')
    print('type feedback:', pg.locator('#teach-section .feedback').inner_text())
    # come-back check
    pg.click('[data-view="comeback"]'); pg.wait_for_timeout(100)
    badge = pg.locator('#due-badge').inner_text()
    pg.click('[data-recheck="n001"]'); pg.wait_for_timeout(100)
    qs = pg.evaluate('''(()=>{const l=ATLAS_LESSONS.n001;const ex=Object.values(ATLAS_EXAMS).flatMap(e=>e.questions.filter(q=>q.topic==='n001'));return [...l.quiz,{q:l.lab.prompt,answer:l.lab.answer},...ex].map(q=>[q.q.slice(0,30),q.answer]);})()''')
    for i in range(3):
        qtext = pg.locator('.question-card .q-title').nth(i).inner_text()
        ans = next(a for t, a in qs if t in qtext)
        pg.click(f'[data-rc-q="{i}"][data-rc-a="{ans}"]')
    pg.click('[data-action="rc-grade"]'); pg.wait_for_timeout(100)
    pg.screenshot(path=f'{shots}/05-mastered.png', full_page=True)
    assert pg.locator('.celebrate').count() == 1, 'not mastered'
    # themes + text size + calm
    pg.click('[data-view="settings"]'); pg.click('[data-pref="theme"][data-val=\'"contrast"\']'); pg.click('[data-pref="fontSize"][data-val="2"]'); pg.click('[data-pref="easyFont"]')
    pg.click('[data-view="home"]'); pg.wait_for_timeout(150); pg.screenshot(path=f'{shots}/06-contrast-large.png')
    pg.click('[data-view="settings"]'); pg.click('[data-pref="theme"][data-val=\'"light"\']'); pg.click('[data-pref="fontSize"][data-val="0"]'); pg.click('[data-pref="calm"]')
    pg.click('[data-view="roadmap"]'); pg.wait_for_timeout(150); pg.screenshot(path=f'{shots}/07-light-calm-roadmap.png')
    # profiles: add + switch -> fresh progress
    pg.click('[data-view="settings"]'); pg.fill('#new-learner', 'Sam'); pg.click('[data-profile-add]')
    pg.click('[data-profile-switch]'); pg.wait_for_timeout(500)
    sam = pg.evaluate("Object.keys(localStorage)")
    print('keys after switch:', sorted(sam))
    print('avatar:', pg.locator('.user-avatar').first.inner_text())
    # lab mission from lesson + grown-up mode with PIN
    pg.click('[data-view="home"]'); pg.click('[data-action="continue"]'); pg.wait_for_timeout(150)
    pg.click('[data-show-mode="adult"]'); pg.screenshot(path=f'{shots}/08-adult-mode.png', full_page=True)
    pg.click('[data-mission]'); pg.wait_for_timeout(200); pg.screenshot(path=f'{shots}/09-mission.png')
    print('badge:', badge, '| errors:', errs)
    b.close()
