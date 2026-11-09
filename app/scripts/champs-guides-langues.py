"""Ajoute des formulaires AcroForm aux repères produits par guides-langues.mjs.
Dépendance de génération uniquement : PyMuPDF==1.26.6 (voir requirements-pdf.txt).
"""
import json, pathlib, sys
import fitz

pdf_path=pathlib.Path(sys.argv[1]);data=json.loads(pathlib.Path(sys.argv[2]).read_text())
doc=fitz.open(pdf_path)
placements=[]
for e in data['exercises']:
    marker='RZFIELD_'+e['id']
    matches=[(i,r) for i,p in enumerate(doc) for r in p.search_for(marker)]
    if len(matches)!=1:raise ValueError(f"Repère {marker}: {len(matches)} occurrences")
    i,rect=matches[0];placements.append((i,rect,e))
for number,(i,rect,e) in enumerate(sorted(placements,key=lambda row:(row[0],row[1].y0,row[1].x0)),1):
    page=doc[i];right=page.rect.width-15*72/25.4
    field_rect=fitz.Rect(rect.x0,rect.y0,right-100,rect.y0+(38 if e['type']=='production' else 22))
    if not page.rect.contains(field_rect):raise ValueError(f"Champ hors page: {e['id']}")
    # Retire uniquement le repère technique dans son espace réservé, sans toucher au cours.
    page.add_redact_annot(rect,fill=False)
    page.apply_redactions(images=0,graphics=0)
    w=fitz.Widget();w.field_name='answer_'+e['id'];w.field_label=f"Exercice {number} : {e['prompt']}"
    w.rect=field_rect;w.border_color=(.45,.5,.46);w.border_width=.6;w.fill_color=(1,1,1)
    w.text_color=(.1,.18,.15);w.text_font='Helv';w.text_fontsize=10;w.field_value=''
    if e['choices']:
        w.field_type=fitz.PDF_WIDGET_TYPE_COMBOBOX
        w.choice_values=['']+[chr(65+j) for j in range(len(e['choices']))]
    else:
        w.field_type=fitz.PDF_WIDGET_TYPE_TEXT;w.field_flags=fitz.PDF_TX_FIELD_IS_MULTILINE;w.text_maxlen=4000
    annot=page.add_widget(w)
    if data['id']=='ar' and not e['choices']:doc.xref_set_key(annot.xref,'Q','2')
    box=fitz.Widget();box.field_name='review_'+e['id'];box.field_label=f'Exercice {number} : à retravailler'
    box.field_type=fitz.PDF_WIDGET_TYPE_CHECKBOX;box.rect=fitz.Rect(right-88,rect.y0+3,right-78,rect.y0+13)
    box.border_color=(.45,.5,.46);box.border_width=.6;box.fill_color=(1,1,1);box.field_value='Off';page.add_widget(box)
# Aucun script PDF : lecture et correction fonctionnent avec les liens standards.
doc.set_metadata({**doc.metadata,'title':f"RévizSTMG - {data['name']} - Guide interactif"})
tmp=pdf_path.with_suffix('.interactive.pdf');doc.save(tmp,garbage=4,deflate=True);doc.close();tmp.replace(pdf_path)
check=fitz.open(pdf_path);widgets=[w for p in check for w in p.widgets()]
assert len(widgets)==2*len(data['exercises'])
assert len({w.field_name for w in widgets})==len(widgets)
assert not any(w.script or w.script_calc or w.script_stroke for w in widgets)
assert all(not p.search_for('RZFIELD_') for p in check)
print(f"{data['id']}: {len(data['exercises'])} réponses, {len(data['exercises'])} cases de suivi")
