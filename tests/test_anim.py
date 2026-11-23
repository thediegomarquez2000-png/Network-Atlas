import os
import sys, os
from playwright.sync_api import sync_playwright
url = 'file://' + os.path.abspath(sys.argv[1]); shots = sys.argv[2]; errs = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME','/usr/bin/google-chrome'), args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1360, 'height': 900})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(300)
    pg.click('[data-view="simulator"]'); pg.wait_for_timeout(200)
    pg.click('[data-em-mission="route"]'); pg.wait_for_timeout(200)
    print('ping buttons:', pg.locator('[data-em="ping"]').count())
    pg.click('[data-em="ping"]'); pg.wait_for_timeout(900)
    n = pg.evaluate("ATLAS_EMULATOR_TEST.getState().trace.events.length")
    print('events', n, [e['type'] for e in pg.evaluate("ATLAS_EMULATOR_TEST.getState().trace.events")])
    stage = pg.locator('.em-stage')
    for k, t in enumerate([1200, 2600, 3200, 4000]):
        pg.wait_for_timeout(t); stage.screenshot(path=f'{shots}/a{k}.png')
        print(k, pg.locator('#em-route-over text').last.text_content())
    pg.click('[data-em-anim="speed"][data-speed="2"]')
    pg.wait_for_timeout(9000)
    stage.screenshot(path=f'{shots}/a-final.png')
    pg.locator('.em-journey').screenshot(path=f'{shots}/a-journey.png')
    print('final caption:', pg.locator('#em-route-over text').last.text_content(), '| button:', pg.locator('[data-em-anim="toggle"]').inner_text())
    # manual step then resume
    pg.click('[data-em-step="3"]'); pg.wait_for_timeout(200)
    print('after manual step button:', pg.locator('[data-em-anim="toggle"]').inner_text())
    # failing mission
    pg.click('[data-em-mission="gateway"]'); pg.wait_for_timeout(200)
    pg.click('[data-em="ping"]'); pg.wait_for_timeout(7000)
    stage.screenshot(path=f'{shots}/a-fail.png')
    print('fail caption:', pg.locator('#em-route-over text').last.text_content())
    print('errors:', errs)
    b.close()
