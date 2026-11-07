import subprocess,json,hashlib,re,sys,datetime,urllib.request
from pathlib import Path
sha=sys.argv[1]
def git(path):return subprocess.check_output(['git','show',f'{sha}:{path}'])
index=git('index.html').decode()
paths=['index.html','sw.js','manifest.webmanifest']
paths+=re.findall(r'(?:src|href)="(?:\./|/)?(assets/index-[^" ]+\.js)"',index)
entry=next(p for p in paths if p.startswith('assets/index-'))
entryText=git(entry).decode()
for prefix in ['contenu-maths-','contenu-p1-maths-','contenu-gestion-finance-','SqlQuery-','public.de-','public.en-','public.es-','public.it-','public.ar-']:
 matches=re.findall(re.escape(prefix)+r'[A-Za-z0-9_-]+\.js',entryText)
 if not matches:
  matches=[p.name for p in Path('app/dist/assets').glob(prefix+'*.js')]
 paths+=['assets/'+name for name in dict.fromkeys(matches)]
paths+=['cours/terminale/mathematiques/chapitre-7-exponentielles-et-logarithme/index.html']
paths+=[f'cours/langues/guide-{lang}.pdf' for lang in ['en','de','ar','es','it']]
results=[]
for p in dict.fromkeys(paths):
 url='https://revizstmg.github.io/'+('' if p=='index.html' else p.removesuffix('index.html') if p.endswith('/index.html') else p)
 with urllib.request.urlopen(urllib.request.Request(url,headers={'Cache-Control':'no-cache'}),timeout=40) as r:body=r.read();status=r.status
 expected=git(p)
 result={'url':url,'status':status,'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest(),'matchesPublishedCommit':body==expected}
 if p.startswith('assets/contenu-maths-'):
  result['mathC8Present']=b'math-c8' in body
  result['legacyMathC7Absent']=b'"math-c7"' not in body
 results.append(result)
 print(status,result['matchesPublishedCommit'],url,flush=True)
 assert status==200 and body==expected,p
out={'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'compiledCommit':sha,'checks':results}
Path('docs/audits/2026-11-07/corrections-public.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
