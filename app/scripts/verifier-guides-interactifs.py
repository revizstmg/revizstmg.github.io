"""Contrôle des cinq PDF, remplissage/enregistrement/relecture dans un dossier temporaire."""
import argparse,collections,hashlib,json,pathlib,re,subprocess,tempfile,unicodedata
import fitz
root=pathlib.Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser();parser.add_argument('--sortie');args=parser.parse_args()
rows=[]
def words(doc):
    return collections.Counter(unicodedata.normalize('NFKC',str(w[4])) for p in doc for w in p.get_text('words') if w[3]<p.rect.height-35)
with tempfile.TemporaryDirectory() as temp:
 for lang in ['en','es','it','ar','de']:
    resource=root/'app/resources/langues';path=resource/f'guide-{lang}.pdf';source=json.loads((resource/f'{lang}.json').read_text());raw=path.read_bytes();doc=fitz.open(path)
    all_widgets=[w for p in doc for w in p.widgets()]
    n=len(source['exercises']);assert len(all_widgets)==2*n,(lang,'nombre de champs')
    fields={w.field_name:w for w in all_widgets};assert len(fields)==2*n
    for e in source['exercises']:
        w=fields['answer_'+e['id']];assert w.field_type==(fitz.PDF_WIDGET_TYPE_COMBOBOX if e['choices'] else fitz.PDF_WIDGET_TYPE_TEXT)
        assert not w.field_value,(lang,'réponse préremplie')
        assert fields['review_'+e['id']].field_type==fitz.PDF_WIDGET_TYPE_CHECKBOX
        if e['choices']:assert w.choice_values==['']+[chr(65+i) for i in range(len(e['choices']))]
    assert not any(w.script or w.script_calc or w.script_stroke for w in all_widgets)
    links=[l for p in doc for l in p.get_links()]
    internal=[l for l in links if l['kind'] in (fitz.LINK_GOTO,fitz.LINK_NAMED)]
    assert len(internal)>=2*n
    assert all(0<=l['page']<len(doc) for l in internal)
    assert len([l for l in links if l['kind']==fitz.LINK_URI])>=len(source['videos'])
    # Le texte antérieur est comparé hors pieds de page ; les nouvelles consignes sont ajoutées.
    old_bytes=subprocess.check_output(['git','show','HEAD:app/resources/langues/guide-'+lang+'.pdf'],cwd=root)
    old=fitz.open(stream=old_bytes,filetype='pdf')
    assert collections.Counter(l.get('uri') for p in old for l in p.get_links() if l['kind']==fitz.LINK_URI)==collections.Counter(l.get('uri') for l in links if l['kind']==fitz.LINK_URI)
    assert collections.Counter(l.get('nameddest') for p in old for l in p.get_links() if l['kind']==fitz.LINK_NAMED)==collections.Counter(l.get('nameddest') for l in links if l['kind']==fitz.LINK_NAMED)
    missing=words(old)-words(doc)
    assert not missing,(lang,'texte antérieur manquant',missing.most_common(15))
    old.close()
    sample='مرحبا بالعالم' if lang=='ar' else 'Réponse test : mañana, perché, Grüße.'
    text_id=next(e['id'] for e in source['exercises'] if not e['choices']);choice_id=next(e['id'] for e in source['exercises'] if e['choices'])
    for page in doc:
        for w in page.widgets():
            if w.field_name=='answer_'+text_id:w.field_value=sample;w.update()
            if w.field_name=='answer_'+choice_id:w.field_value='A';w.update()
            if w.field_name=='review_'+text_id:w.field_value=w.on_state();w.update()
    copy=pathlib.Path(temp)/f'filled-{lang}.pdf';doc.save(copy);doc.close()
    read=fitz.open(copy);values={w.field_name:w.field_value for p in read for w in p.widgets()}
    assert values['answer_'+text_id]==sample
    assert values['answer_'+choice_id]=='A'
    assert values['review_'+text_id] not in [None,False,'Off','']
    if args.sortie:
        for p in read:
            w=next((w for w in p.widgets() if w.field_name=='answer_'+text_id),None)
            if w:
                p.get_pixmap(matrix=fitz.Matrix(1.5,1.5)).save(str(pathlib.Path(args.sortie).parent/f'guide-{lang}-rempli.png'));break
    rows.append({'reference':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root).decode().strip(),'langue':lang,'pages':len(read),'reponses':n,'casesSuivi':n,'liensInternes':len(internal),'texteAnterieurConserve':True,'saisieRelue':sample,'choixRelu':'A','suiviRelu':values['review_'+text_id],'sha256':hashlib.sha256(raw).hexdigest()})
    read.close();assert path.read_bytes()==raw
if args.sortie:pathlib.Path(args.sortie).write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(rows,ensure_ascii=False,indent=2))
