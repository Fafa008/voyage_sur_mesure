# TODO — CRUD d'images des circuits

## Objectif

Résoudre le CRUD d'images liées aux circuits (model `ImageCircuit`).

## Étapes

- [x] 1. Créer `app/api/upload/route.ts` — handler POST d'upload (sauvegarde dans `public/uploads/circuits/`, renvoie l'URL)
- [x] 2. Créer `components/admin/circuits/ImageManager.tsx` — composant client (upload multiple, aperçus, suppression, légende, ordre, hidden input JSON `images`)
- [x] 3. Modifier `app/admin/circuits/actions/update-circuit.action.ts` — ajouter la gestion des images (remplacement complet)
- [x] 4. Modifier `app/admin/circuits/nouveau/page.tsx` — intégrer `<ImageManager />`
- [x] 5. Modifier `app/admin/circuits/[id]/edit/page.tsx` — intégrer `<ImageManager />` avec les images existantes
- [x] 6. Vérifier le build / lint (`npx tsc --noEmit` — OK)
