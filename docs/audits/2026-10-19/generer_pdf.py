from pathlib import Path
import json, re, math, html
# Génère le PDF, sa version Markdown et le plan à partir des mêmes fiches.
# Dépendances : reportlab, Pillow et polices DejaVu (chemin Linux ci-dessous).
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,Table,TableStyle,KeepTogether,Flowable
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image
out=Path(__file__).resolve().parent;root=out.parents[2];actions=json.loads((out/'actions.json').read_text())
for name,file in [('Sans','DejaVuSans.ttf'),('SansBold','DejaVuSans-Bold.ttf'),('Serif','DejaVuSerif.ttf')]:pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+file))
pdfmetrics.registerFontFamily('Sans',normal='Sans',bold='SansBold',italic='Sans',boldItalic='SansBold')
ink=colors.HexColor('#25251F');gold=colors.HexColor('#95743A');muted=colors.HexColor('#5F635C');paper=colors.HexColor('#F6F2E8');line=colors.HexColor('#E0DACB')
styles=getSampleStyleSheet()
for n in ['BodyText','Normal']:styles[n].fontName='Sans'
styles.add(ParagraphStyle(name='B',fontName='Sans',fontSize=9,leading=13.8,textColor=ink,spaceAfter=7))
styles.add(ParagraphStyle(name='Small',fontName='Sans',fontSize=7.5,leading=11,textColor=muted,spaceAfter=5))
styles.add(ParagraphStyle(name='H1a',fontName='Serif',fontSize=25,leading=30,textColor=ink,spaceAfter=14))
styles.add(ParagraphStyle(name='H2a',fontName='SansBold',fontSize=12,leading=17,textColor=ink,spaceBefore=12,spaceAfter=7))
styles.add(ParagraphStyle(name='H3a',fontName='SansBold',fontSize=10.5,leading=15,textColor=ink,spaceAfter=7))
styles.add(ParagraphStyle(name='Tiny',fontName='Sans',fontSize=6.8,leading=9.5,textColor=muted,spaceAfter=0))
styles.add(ParagraphStyle(name='K',fontName='SansBold',fontSize=8,leading=12,textColor=gold,spaceAfter=10,tracking=1.3))
W,H=595.2756,841.8898;cw=W-96
def clean(s):
 s=re.sub(r'\b([a-zà-ÿ]{3,})(?=\d)',r'\1 ',str(s),flags=re.I)
 s=re.sub(r'(\d)(?=[a-zà-ÿ]{3,}\b)',r'\1 ',s)
 s=re.sub(r'\b(à|de|en|du|le|la|et|sur)(?=\d)',r'\1 ',s,flags=re.I)
 s=re.sub(r'(\d)(%|€)',r'\1 \2',s)
 return s.replace('Sourceapplicative','Source applicative').replace('×2profils',' × 2 profils')
P=lambda s,style='B':Paragraph(html.escape(clean(s)).replace('\n','<br/>'),styles[style])
def rich(s,style='B'):return Paragraph(clean(s),styles[style])
def bullet(s):return rich('• '+html.escape(s))
def table(rows,widths,header=True,compact=False):
 data=[[P(c,'Tiny' if compact else 'Small') for c in row] for row in rows]
 t=Table(data,colWidths=widths,hAlign='LEFT',repeatRows=1 if header else 0)
 cmd=[('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LINEBELOW',(0,0),(-1,0),.6,gold)]
 if header:cmd+=[('BACKGROUND',(0,0),(-1,0),paper)]
 if compact:cmd += [('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]
 cmd += [('LINEBELOW',(0,1),(-1,-1),.3,line)]
 t.setStyle(TableStyle(cmd));return t
class TopImage(Flowable):
 def __init__(self,path,w,h,cropheight=900):Flowable.__init__(self);self.path=str(path);self.width=w;self.height=h;self.cropheight=cropheight
 def draw(self):
  iw,ih=Image.open(self.path).size;sc=self.width/iw
  self.canv.saveState();p=self.canv.beginPath();p.rect(0,0,self.width,self.height);self.canv.clipPath(p,stroke=0,fill=0)
  # Montrer le haut de la capture, sans modifier le fichier source.
  self.canv.drawImage(self.path,0,self.height-ih*sc,width=self.width,height=ih*sc,mask='auto');self.canv.restoreState()
def decor(c,d):
 c.setTitle('RévizSTMG — Audit global et plan d’amélioration — 19 octobre 2026');c.setAuthor('Codex — synthèse de trois agents');c.setSubject('Expérience utilisateur, fiabilité, pédagogie et accessibilité')
 c.setFillColor(paper);c.rect(0,H-37,W,37,stroke=0,fill=1)
 c.setFont('SansBold',7.5);c.setFillColor(gold);c.drawString(48,H-23,'RÉVIZSTMG  /  AUDIT GLOBAL')
 c.setStrokeColor(line);c.line(48,40,W-48,40)
 c.setFont('Sans',7);c.setFillColor(muted);c.drawString(48,27,'19 octobre 2026 · source 6a32b03 · rapport de recommandations')
 c.drawRightString(W-48,27,f'{d.page}')
story=[]
def page(title,kicker=None):
 if story:story.append(PageBreak())
 if kicker:story.append(P(kicker,'K'))
 story.append(P(title,'H1a'))
page('Audit global\net plan d’amélioration','19 OCTOBRE 2026  •  SYNTHÈSE PARTAGÉE AVEC CLAUDE')
story += [Spacer(1,12),P('Expérience utilisateur, fiabilité, pédagogie et accessibilité. Une lecture commune pour décider quoi améliorer, dans quel ordre et comment vérifier le résultat.'),Spacer(1,16)]
story.append(table([['3 agents','198 tests réussis','23 actions'],['Trois périmètres complémentaires, rapports individuels conservés.','Tests unitaires du code actuel ; compilation séparée réussie.','Priorités, preuves, effort indicatif et critères de livraison.']],[cw/3]*3))
story += [Spacer(1,22),P('Priorité à la fiabilité du travail de l’élève, à la cohérence des exercices et à une navigation accessible.','H2a'),P('Le site possède déjà une base utile : cours chargés à la demande, matières compactes en haut de l’accueil, reprise de lecture, atelier chiffré, trousse d’outils et plusieurs mécanismes de protection des sessions. Ces acquis sont à conserver.'),P('Ce rapport propose des améliorations. Il ne décrit pas des corrections déjà appliquées et ne certifie ni la sécurité en production, ni l’accessibilité complète, ni chaque notion des 806 sections de cours.','Small'),Spacer(1,12)]
story.append(rich('Dossier partagé : <link href="https://github.com/revizstmg/revizstmg.github.io/pull/25" color="#95743A">PR GitHub #25</link>. Les rapports détaillés, captures et critères sont livrés avec le PDF.'))
page('Ce qu’il faut traiter d’abord','SYNTHÈSE DÉCISIONNELLE')
summary=[('1. Fiabiliser la progression','Relire et intégrer la PR #14 déjà préparée par Claude, après recette sur la version actuelle. Éviter une seconde implémentation.'),('2. Corriger le fond connu','Écriture comptable de19€, dossiers documentaires hors chapitre et formulation juridique : contre-exemples déjà documentés.'),('3. Lever les obstacles immédiats','Menu et panneau Accessibilité au clavier ; bouton de génération de l’atelier toujours à portée ; explications de progression lisibles.'),('4. Aligner les promesses','Distinguer quiz et vrai format du bac, expliquer le moteur personnalisé, afficher une date passée correctement et qualifier les droits sociaux.'),('5. Préparer la suite','Envoi fiable des QCM de classe, préparation hors ligne, parcours par formule et vérification des récompenses avant toute activation commerciale.')]
for t,b in summary:story += [P(t,'H2a'),P(b)]
story += [P('Lecture des priorités','H2a'),P('P1 : problème qui gêne le travail, la compréhension ou l’accès ; à traiter en premier. P2 : amélioration importante de confort, robustesse ou qualité. Aucun nouveau P0 confirmé par cette inspection. Les droits de production restent à qualifier : un défaut réel d’isolation changerait cette priorité.'),P('Les efforts sont indicatifs, pas des délais contractuels. Ils incluent rarement une relecture métier approfondie ou les dépendances de serveur. Les responsabilités proposées doivent être confirmées dans le journal partagé.','Small')]
page('Méthode et portée réelle','CE QUI A ÉTÉ VÉRIFIÉ')
for s in [
'Code applicatif de main au commit6a32b03, équivalent pour les modules examinés au début de l’audit. Un build frais a été produit dans un dossier séparé ; le build app/dist plus ancien n’a pas été pris pour l’état actuel quand il différait.',
'Cartographie des34 déclarations de routes : pages, variantes dynamiques, compatibilités et page introuvable. Lecture des modules de compte, stockage, synchronisation, social, progression, boutique et PWA.',
'UX :29 routes ouvertes à390 et1280px. Après attente courte,27/29 et23/29 étaient rendues dans le premier balayage. Les pages encore en chargement ne sont pas comptées comme validées ; accueil, atelier et menu ont été repris sur le site publié et le build frais.',
'Pédagogie :12 routes sur deux profils, Première/mobile et Terminale GF/bureau, soit24 visites. Les quatre bacs blancs/lecteurs chargés lentement ont été repris jusqu’au contenu ; atelier testé jusqu’au bilan.',
'Contrôles ciblés : focus/Échap du menu et d’Accessibilité, formule correcte/erronée, date de bac passée, simulations locales de fusion et de dates.198 tests unitaires réussis ; compilation de313 modules réussie.'
]:story.append(bullet(s))
story += [P('Limites à garder visibles','H2a'),P('Comptes fictifs uniquement ; réseau limité au site ou à la prévisualisation. Aucun compte réel, donnée d’élève ou paiement manipulé. Pas de certification RGPD, audit WCAG complet, lecteur d’écran manuel, test de permissions réelles Supabase ni synchronisation multi-appareil réelle. Les constats serveur sont donc conditionnels.'),P('Les806 sections ne sont pas toutes relues factuellement. L’audit de cours antérieur est réutilisé pour ses anomalies reproduites, en signalant cette provenance. Une revue humaine complète par matière reste à organiser.'),P('Traces : rapports des trois agents, mesures JSON, captures et audit de cours PR #24. Les données d’exemple visibles dans les captures appartiennent au profil fictif de test.','Small')]
page('Tableau des actions','VUE D’ENSEMBLE')
rows=[['ID','Prio.','Action','Situation / coordination']]
for a in actions:rows.append([a['id'],a['priority'],a['title'],('Déjà en PR #14' if a['id']=='A01' else 'À cadrer avec #18' if a['id']=='A06' else 'À traiter / vérifier')])
story.append(table(rows,[35,40,235,cw-310],compact=True))
# Fiches : deux par page, sans couper une fiche.
for i,a in enumerate(actions):
 if i%2==0:page('Actions détaillées',f'FICHES {i+1:02d} À {min(i+2,len(actions)):02d}')
 contents=[P(f"{a['id']} · {a['priority']}  —  {a['title']}",'H2a'),P(a['status'],'Small')]
 for label,key in [('Impact','impact'),('Preuve / limite','proof'),('À faire','action'),('Critère de livraison','accept')]:contents.append(rich(f'<b>{label}.</b> '+html.escape(a[key])))
 contents += [rich('<b>Effort indicatif.</b> '+html.escape(a['effort']),'Small'),rich('<b>Coordination.</b> '+html.escape(a['coord']),'Small'),P('Repères des rapports agents : '+a['refs'],'Small'),Spacer(1,12)]
 story.append(KeepTogether(contents))
page('Partager le travail avec Claude','ORDRE PROPOSÉ ET DÉPENDANCES')
story.append(table([['Travail ouvert','Traitement recommandé'],['#14 — Progression fiable','Relire le diff, résoudre les conflits, tester sauvegardes/dates/récompenses et vérifier la publication. Couvre déjà T01/T02/T03/T04/T06.'],['#18 — Suppression de compte','Vérifier que promesse, données partagées, identité et confirmation finale correspondent ; coordonner la validation des droits.'],['#20 — Mes notes','Décider l’intégration du parcours et éviter une seconde fonction de notes concurrente. Ne pas présenter cette PR ouverte comme déjà publiée.'],['#13 — Répartition des tâches','Respecter les couloirs et la décision du propriétaire ; ne pas attribuer un nouveau chantier à Claude à sa place.'],['#24 — Audit de cours','Utiliser les preuves pour réserver une correction de contenu séparée, puis relecture métier.'],['#25 — Audit global','Point d’entrée partagé : PDF, Markdown, backlog et rapports agents. Aucune correction applicative dans cette livraison.']],[145,cw-145]))
for title,body in [('Lot1 — Protéger le travail et le contenu','A01 à A08, avec A14 pour les libellés utiles : sauvegardes, chapitres, clavier, lancement, transmission classe, qualification des droits, calendrier et promesse du bac.'),('Lot2 — Rendre l’entraînement plus utile','A10, A15 à A20 : première action, boutique accessible, guidage, objectifs équilibrés, atelier pédagogique et navigation.'),('Lot3 — Consolider la plateforme','A09, A11 à A13, A21 à A23 : récompenses vérifiées, hors ligne, actions réseau, parent, langues, performance et connexion.')]:story += [P(title,'H2a'),P(body)]
story.append(P('Ordre proposé, non décision d’affectation. Pour chaque chantier : annoncer propriétaire et périmètre, lier une PR, définir la recette, puis noter séparément « corrigé », « fusionné » et « publié ».','Small'))
page('Recette commune et couverture','CHECKLIST AVANT DE DIRE « TERMINÉ »')
for s in ['Téléphone360/390px et bureau1280px ; clair/sombre ; français et arabe/RTL ; zoom200% ; clavier seul et contrôle lecteur d’écran sur les panneaux.','Nouveau visiteur, élève récurrent, Première et Terminale, compte sans données et avancé ; conserver les matières haut placées et les deux cartes appréciées.','Atelier : longue sélection, recherche vide, virgule/point, erreur puis correction, bilan, reprise et lancement sans remontée.','Sauvegarde : note seule, suppression, deux appareils simulés, perte réseau, session renouvelée, déconnexion et minuit/changement d’heure.','Classe : soumission interrompue puis renvoi unique ; social : droits, panne et absence de données distingués ; parent : consentement, révocation et visibilité.','Cours : contre-exemples comptables/juridiques corrigés, rattachement strict du dossier à sa section, relecture humaine ciblée puis extension matière par matière.']:
 story.append(bullet(s))
story += [P('Familles de pages examinées','H2a'),P('Entrée et choix de filière ; accueil et trousse ; matière, thème et lecteur ; favoris, badges et profil ; minuterie, révision, bac blanc, programme, Grand Oral et étude de gestion ; entraînement personnalisé, photo, défi et atelier ; méthodologie et guide ; boutique ; classe, amis, classement et parent ; confidentialité, CGU, FAQ et page introuvable.'),P('Les onglets et variantes sociales/professeur ont été étudiés dans le code, mais pas tous exercés avec de vrais comptes. Les compatibilités sont cartographiées ; la cartographie n’équivaut pas à une validation de toutes les données possibles.','Small')]
page('Repères visuels','CAPTURES DE TEST — DONNÉES FICTIVES')
w=(cw-24)/3;h=330
figures=[]
for name,caption in [('accueil-mobile.png','Accueil publié : bandeau et matières compactes à conserver.'),('menu-mobile.png','Menu mobile : comportement clavier reproduit et journalisé.'),('accessibilite.png','Panneau Accessibilité : sémantique et focus à corriger.')]:
 figures.append([TopImage(out/'captures'/name,w,h),P(caption,'Small')])
t=Table([[figures[j][0] for j in range(3)],[figures[j][1] for j in range(3)]],colWidths=[w+8]*3,hAlign='LEFT');t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,1),(-1,1),10)]));story.append(t)
story += [Spacer(1,18),P('Les captures longues sont cadrées sur leur partie haute pour rester lisibles. Les fichiers originaux sont fournis à côté du PDF. Une image ne démontre pas à elle seule un défaut de focus : les mesures et reproductions JSON complètent la preuve.','Small'),P('Sources et traçabilité','H2a')]
for text,url in [('Rapport partagé et échanges GitHub — PR #25','https://github.com/revizstmg/revizstmg.github.io/pull/25'),('Correctifs de progression en cours — PR #14','https://github.com/revizstmg/revizstmg.github.io/pull/14'),('Audit pédagogique antérieur — PR #24','https://github.com/revizstmg/revizstmg.github.io/pull/24')]:story.append(rich(f'<link href="{url}" color="#95743A">{html.escape(text)}</link>'))
story.append(P('Rapports agents : experience-utilisateur.md (14 points), fiabilite-technique.md (14 points), pedagogie-accessibilite.md (11 points). Les23 actions consolident ces39 points ; chaque fiche indique ses repères de provenance.','Small'))
pdf=out/'RevizSTMG-audit-global-2026-10-19.pdf'
doc=SimpleDocTemplate(str(pdf),pagesize=(W,H),rightMargin=48,leftMargin=48,topMargin=62,bottomMargin=57,allowSplitting=1)
doc.build(story,onFirstPage=decor,onLaterPages=decor)
# Version texte et backlog issus des mêmes fiches.
md='# RévizSTMG — audit global et plan d’amélioration\n\n19 octobre2026 (Europe/Paris). Sourceapplicative `6a32b03`. Trois agents,198 tests réussis, compilation fraîche séparée.\n\n'
md+='[PDF](RevizSTMG-audit-global-2026-10-19.pdf) · [PR partagée #25](https://github.com/revizstmg/revizstmg.github.io/pull/25)\n\n'
md+='## Synthèse\n\nPriorité à la sauvegarde, aux exercices strictement liés aux chapitres, au clavier et au lancement de l’atelier. Les correctifs déjà en PR #14 doivent être relus et intégrés plutôt que réimplémentés. Les droits serveur restent à vérifier ; aucune fuite actuelle ni conformité générale n’est affirmée.\n\n'
md+='## Méthode et limites\n\n34 déclarations de routes cartographiées.29 routes ouvertes aux deux tailles (27/29 et23/29 rendues après attente courte, chargements distingués) ; reprises ciblées sur site publié et build frais.12 routes×2profils dans l’audit pédagogique, avec reprise des quatre chargements lourds et atelier jusqu’au bilan. Lecture des fonctions sociales, PWA, compte et progression.\n\nAucun vrai compte ni donnée d’élève, aucune modification de production. Pas de certification de sécurité, RGPD ou WCAG ; pas de contrôle des droits réels Supabase ou relecture exhaustive des806cours. Le rapport antérieur de cours est réutilisé explicitement.\n\n'
for a in actions:
 md+=f"## {a['id']} — {a['title']}\n\n**{a['priority']} · {a['status']}**\n\n"
 for label,key in [('Impact','impact'),('Preuve et limite','proof'),('Action proposée','action'),('Critère de livraison','accept'),('Effort indicatif','effort'),('Coordination','coord'),('Provenance','refs')]:md+=f"**{label} :** {a[key]}\n\n"
md+='## Coordination et livraison\n\n- PR #14 : sauvegarde, fusion, état, récompense hebdomadaire et dates ; relecture/recette avant intégration.\n- PR #18 : suppression complète, promesse UI et vérification des droits.\n- PR #20 : Mes notes, intégration à décider.\n- PR #13 : répartition à respecter, sans attribuer une tâche à Claude à sa place.\n- PR #24 : preuves pédagogiques à convertir en corrections séparées.\n- PR #25 : cette livraison documentaire, sans correctif de production.\n\n'
md+='## Rapports et preuves\n\n- [Expérience utilisateur](agents/experience-utilisateur.md)\n- [Fiabilité technique](agents/fiabilite-technique.md)\n- [Pédagogie et accessibilité](agents/pedagogie-accessibilite.md)\n- [Mesures UX](captures/mesures-ux.json)\n- [Interactions pédagogiques](captures/interactions-pedagogiques.json)\n\nLes captures montrent exclusivement un profil fictif. Les efforts sont des estimations, les responsables sont à confirmer dans le journal. Aucun changement applicatif ni backend livré par cet audit.\n'
(out/'README.md').write_text(clean(md))
backlog='# Plan d’actions partagé — à attribuer dans le journal\n\nLes responsables ne sont pas imposés. Commencer par relire la PR #14 de Claude ; créer ensuite des PR distinctes avec périmètre et critères.\n\n| ID | Priorité | Action | Effort indicatif | Coordination |\n|---|---|---|---|---|\n'
for a in actions:backlog+=f"| {a['id']} | {a['priority']} | {a['title']} | {a['effort']} | {a['coord']} |\n"
backlog+='\nLes critères de livraison sont détaillés dans [le rapport texte](README.md) et le PDF. P1 avant P2 ; vérifier les dépendances de base et de produit, notamment avant toute récompense commerciale réelle.\n'
(out/'PLAN-ACTIONS.md').write_text(clean(backlog))
print(pdf)
