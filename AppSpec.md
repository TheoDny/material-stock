Fait moi un prompt propre en anglais qui résume mes besoin ci dessous


Pour la construction d'une application web en NextJs 15 avec betterAuth, shadcn-ui, prisma , next-safe-action v7 et zod 
met en place de Internationalization
le code doit être en anglais



Seeder
création d'un role Admin possèdant tout les droits
créattion d'un Utilisateur admin (email : admin@admin.com ,pwd  : Admin1234!)
création des différente permissions nécessaire 

user_create, user_read, user_edit
role_create, role_read, role_edit
tag_create,tag_read, tag_edit
charac_create, charac_edit, charac_read

Authentification
Mot de passe possèdant au moins 16 carractère avec 1 maj et 1 carractère spécial
page de Login utilisant l'authentification via mail / password 
avec mot de passe oublié

gestion des roles
role : 
- nom
- description
- liste de permissions

dans le tableau de gauche les roles (cochable) (plus icon button pour créé ou modifier)

permission: 
- code

dans le tableau de droite la liste des permissions que l'on peut assigner aux role cocher dans le tableau de droite 
notification si l'assignation de la permission au role a réussi ou non (success ou failure)

Page des Tag

list des Tag avec leur représention déja créé avec info du nombre de Material dans lequel le tag est lié

Création de tag 
pour les couleur il faut un color picker qui affiche un exemple avec le name de ce que cela va donner
Tag : 
- colorText
- color
- name (inchangeable)

Page des caractéristique 
liste des caractéristique déjà créé  avec info du nombre de Material 
Création de caractéristique
Characteristic
 - nom
- description
- type (inchangeable) 
- options (inchangeable) (nullabel)
- units (nullable)
type =>  enum ("checkbox", "select", "radio" , "multiselect", "text" , "textarea", "number" ,"float", "email", "date", "dateHour", "dateRange" , "dateHourRange", "link" )


Page des Material
tableau avec les material (name - description - tags - date_edit)

Création de Material
Material_Characteristic:
- value
- id Characteristic

Material:
- nom 
- descritpion
- list de Tag
- liste de Material_Characteristic
- order_Material_Characteristic ( json array avec les id_Material_Characteristic)
- date_create
- date_edit 
date_edit  doit aussi s'update si : 
une value de ses Material_Characteristic change

a chaque modification d'un Material ou d'une de ses Material_Characteristic il faut recréer un Saved_Material

Page d'histotique des Material
Saved_Material
- date_create
- id_material
- nom
- description
- liste de tag
- json array dans l'odre de order_Material_Characteristic { value , units, type, nom , description } 


Fait moi un prompt propre en anglais qui résume mes besoin ci dessus 