const rows=[
 ['drag','Déplacer','Move','Mover','Sposta','نقل','Verschieben'],
 ['dragHelp','Maintiens la poignée ⠿, puis glisse pour changer l’ordre. Les flèches fonctionnent aussi.','Hold the ⠿ handle, then drag to reorder. You can also use the arrows.','Mantén el asa ⠿ y arrastra para ordenar. También puedes usar las flechas.','Tieni premuta la maniglia ⠿ e trascina. Puoi anche usare le frecce.','اضغط مطولاً على المقبض ⠿ ثم اسحبه لتغيير الترتيب. يمكنك استخدام الأسهم أيضاً.','Halte den Griff ⠿ gedrückt und ziehe zum Sortieren. Du kannst auch die Pfeile verwenden.'],
 ['dragActive','Déplacement activé.','Moving enabled.','Movimiento activado.','Spostamento attivo.','تم تفعيل النقل.','Verschieben aktiviert.'],
 ['dragSaved','Ordre des onglets enregistré.','Tab order saved.','Orden guardado.','Ordine salvato.','تم حفظ الترتيب.','Tab-Reihenfolge gespeichert.'],
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
