const rows=[
 ['main','Navigation principale','Main navigation','Navegación principal','Navigazione principale','التنقل الرئيسي','Hauptnavigation'],
 ['learn','Apprendre et réviser','Learn and revise','Aprender y repasar','Imparare e ripassare','التعلّم والمراجعة','Lernen und wiederholen'],
 ['community','Ma communauté','My community','Mi comunidad','La mia comunità','مجتمعي','Meine Gemeinschaft'],
 ['tools','Plus d’outils','More tools','Más herramientas','Altri strumenti','المزيد من الأدوات','Weitere Werkzeuge'],
 ['quick','Réglages rapides','Quick settings','Ajustes rápidos','Impostazioni rapide','إعدادات سريعة','Schnelleinstellungen'],
 ['choose','Choisir mes onglets','Choose my tabs','Elegir mis pestañas','Scegli le mie schede','اختيار علامات التبويب','Meine Tabs auswählen'],
 ['limit','Retire un onglet pour en ajouter un autre.','Remove a tab to add another.','Quita una pestaña para añadir otra.','Rimuovi una scheda per aggiungerne un’altra.','أزل علامة تبويب لإضافة أخرى.','Entferne einen Tab, um einen anderen hinzuzufügen.'],
 ['up','Monter','Move up','Subir','Sposta su','نقل للأعلى','Nach oben'],
 ['down','Descendre','Move down','Bajar','Sposta giù','نقل للأسفل','Nach unten'],
 ['remove','Retirer','Remove','Quitar','Rimuovi','إزالة','Entfernen'],
]
export const navigationMessages=Object.fromEntries(['fr','en','es','it','ar','de'].map((lang,i)=>[lang,Object.fromEntries(rows.map(([key,...texts])=>[key,texts[i]]))]))
