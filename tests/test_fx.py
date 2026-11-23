import os
import sys, os
from playwright.sync_api import sync_playwright
url='file://'+os.path.abspath(sys.argv[1]);shots=sys.argv[2];errs=[]
FILL='''(pct)=>{const T=window.ATLAS_FINAL_TEST,s=T.store();const its=T.buildForm(s.cur.form,s.cur.seed);let k=0;for(const it of its){const good=((k++*37)%100)<pct*100;let a;
 if(it.t==='mc')a=good?0:1;else if(it.t==='multi')a=good?[...Array(it.k).keys()]:[it.o.length-1,...Array(it.k-1).keys()].slice(0,it.k);else if(it.t==='input')a=good?it.i[0]:'wrong';else if(it.t==='order')a=good?[...it.ord.keys()]:[...it.ord.keys()].reverse();else a=good?it.pr.map(p=>p[1]):it.pr.map(()=>it.pr[0][1]);s.cur.answers[it.n]=a;}s.cur.i=its.length-1;}'''
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('CHROME','/usr/bin/google-chrome'),args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':1360,'height':900},accept_downloads=True);pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(url);pg.wait_for_timeout(300)
    pg.click('[data-view="final"]');pg.wait_for_timeout(200);pg.screenshot(path=f'{shots}/f1-lobby.png',full_page=True)
    pg.click('[data-fx="start"][data-form="C"]');pg.wait_for_timeout(200)
    print('bar:',pg.locator('.fx-bar').inner_text().replace('\n',' | '))
    # skip warning
    pg.click('[data-fx="next"]');print('warn shown:',pg.locator('.feedback.hint').count())
    # answer whatever types appear for the first 12 questions through the UI
    seen=set()
    for k in range(14):
        if pg.locator('#fx-input').count(): pg.fill('#fx-input','show ip interface brief');seen.add('input')
        elif pg.locator('.fx-chip:not(.on)').count():
            while pg.locator('[data-fx="order"]').count(): pg.locator('[data-fx="order"]').first.click()
            seen.add('order')
        elif pg.locator('[data-fx-match]').count():
            for s in pg.locator('[data-fx-match]').all(): s.select_option(index=1)
            seen.add('match')
        elif pg.locator('.fx-choose').count():
            for o in pg.locator('[data-fx="pick"]').all()[:4]: o.click()
            seen.add('multi')
        else: pg.locator('[data-fx="pick"]').first.click();seen.add('mc')
        if k==3: pg.screenshot(path=f'{shots}/f2-question.png',full_page=True)
        if pg.locator('.fx-exhibit').count() and 'ex' not in seen: seen.add('ex');pg.screenshot(path=f'{shots}/f3-exhibit.png',full_page=True)
        pg.click('[data-fx="next"]');pg.wait_for_timeout(60)
    pg.wait_for_timeout(2200);print('types seen:',seen,'| back button present:',pg.locator('[data-fx="prev"]').count())
    print('timer:',pg.locator('#fx-timer').inner_text())
    # pause + resume keeps state
    pg.click('[data-fx="pause"]');pg.wait_for_timeout(100);print('resume card:',pg.locator('.fx-resume').inner_text()[:80].replace('\n',' '))
    pg.click('[data-fx="resume"]');pg.wait_for_timeout(100)
    pg.evaluate(FILL,0.62);pg.click('[data-view="home"]')
    pg.click('[data-view="final"]');pg.wait_for_timeout(100);pg.locator('[data-fx="resume"]').click() if pg.locator('[data-fx="resume"]').count() else None
    pg.click('[data-fx="next"]');pg.wait_for_timeout(300)
    pg.screenshot(path=f'{shots}/f4-results.png',full_page=True)
    print('score:',pg.locator('.fx-score').inner_text().replace('\n',' | ')[:160])
    # form A at 80%
    pg.click('[data-fx="lobby"]');pg.click('[data-fx="start"][data-form="A"]');pg.evaluate(FILL,0.8);pg.click('[data-view="home"]');pg.click('[data-view="final"]');pg.wait_for_timeout(100);pg.locator('[data-fx="resume"]').click() if pg.locator('[data-fx="resume"]').count() else None;pg.click('[data-fx="next"]');pg.wait_for_timeout(300)
    pg.locator('.fx-map').screenshot(path=f'{shots}/f5-map.png')
    pg.fill('#fx-notes','I learn best by talking it through. I need diagrams.')
    with pg.expect_download(timeout=30000) as dl: pg.click('[data-fx="pdf"]')
    d=dl.value;d.save_as(f'{shots}/report.pdf');print('pdf saved',os.path.getsize(f'{shots}/report.pdf'))
    with pg.expect_download() as dl2: pg.click('[data-fx="md"]')
    dl2.value.save_as(f'{shots}/report.md')
    print('errors:',errs)
    b.close()
