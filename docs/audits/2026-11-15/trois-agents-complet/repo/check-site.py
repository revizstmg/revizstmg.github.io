from pathlib import Path
import re,json,urllib.request,urllib.parse,xml.etree.ElementTree as ET,hashlib,concurrent.futures
from html.parser import HTMLParser
root=Path('/workspace/work/audit3-20261115-repo');out={}
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'};tree=ET.parse(root/'sitemap.xml');urls=[x.text for x in tree.findall('s:url/s:loc',ns)]
missing=[]
for u in urls:
 p=root/urllib.parse.unquote(urllib.parse.urlparse(u).path).lstrip('/')
 if p.is_dir():p=p/'index.html'
 if not p.is_file():missing.append(u)
out['sitemap']={'urls':len(urls),'unique':len(set(urls)),'missingLocal':missing,'hashRoutes':[u for u in urls if '#' in u]}
sw=(root/'sw.js').read_text();pre=json.loads(re.search(r'const PRECACHE = (\[[^\]]*\])',sw)[1]);out['serviceWorker']={'precache':len(pre),'missing':[p for p in pre if not(root/p.removeprefix('./')).is_file()]}
paths=['index.html','404.html','sw.js','manifest.webmanifest','robots.txt','sitemap.xml','sitemap.txt','llms.txt','cours/index.html','a-propos/index.html','partager/index.html','cours/terminale/gestion-et-finance/appliquer-les-regles-comptables/la-tva-collectee-deductible-a-decaisser/index.html']
main=re.search(r'src="(?:\./|/)?(assets/index-[^"]+\.js)"',(root/'index.html').read_text())[1];paths.append(main)
entry=(root/main).read_text()
for name in ['Friends','FormulaWorkshop','Revise','Avenir']:
 m=re.search(name+r'-[A-Za-z0-9_-]+\.js',entry)
 if m:paths.append('assets/'+m[0])
for lang in ['en','es','it','de','ar']:
 m=re.search('public\\.'+lang+r'-[A-Za-z0-9_-]+\.js',entry)
 if m:paths.append('assets/'+m[0])
def check(path):
 try:
  requestPath=path[:-10] if path.endswith('index.html') else path
  url='https://revizstmg.github.io/'+requestPath
  with urllib.request.urlopen(url,timeout=30) as r:data=r.read();status=r.status;ct=r.headers.get('Content-Type')
  local=(root/path).read_bytes()
  return {'path':path,'status':status,'contentType':ct,'matchesGit':data==local,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}
 except Exception as e:return {'path':path,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as p:out['publicFiles']=list(p.map(check,paths))
# Content metadata on all generated HTML course pages, without browser execution.
htmls=list((root/'cours').rglob('index.html'));meta=[]
for p in htmls:
 s=p.read_text();errors=[]
 for kind,pat in [('title',r'<title>[^<]+</title>'),('h1',r'<h1\b'),('canonical',r'rel="canonical"'),('description',r'name="description"')]:
  if not re.search(pat,s):errors.append(kind)
 if errors:meta.append({'path':str(p.relative_to(root)),'missing':errors})
out['courseMetadata']={'pages':len(htmls),'issues':meta}
out['sourceRef']='08f6a79c6401b3dcb7369252aa809eb9c437fce7';out['compiledRef']='8347153108807c4f81068e669ad123a245345875'
Path('/workspace/output/audit3-20261115/repo/site-public.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print({'sitemap':out['sitemap'],'serviceWorker':out['serviceWorker'],'publicFiles':len(paths),'publicProblems':[r for r in out['publicFiles'] if r.get('error')or not r.get('matchesGit')],'metadataIssues':len(meta)})
