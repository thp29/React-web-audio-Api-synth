//point dentree du serveur node JS/Express

const express = require('express');
const fs = require('fs');
const cors_= require('cors');

const app = express();
const PORT = 3001; // Un port distinct de Vite (pour client React, qui tourne sur 5173)

//pour analyser le JSON reçu dans les requêtes
app.use(express.json());
//pour dire a express dutiliser module 'cors' pour eviter blocage de secu des requets , par navigateur
app.use(cors_());

// config DU SERVEUR EXPRESS, quand on ECOUTE les requetes "post" recu par notre serveur express/node js (en provenace du front react)
//'/api ...' = adresse/url de la requete
//req = objet contenant requete entier envoye par client
// res= objet pour repondre au client , avec un code
app.post('/api/preset', (req,res) => {

    // param stringify : null on garde tout de lobjet recu, et 2 : pour indentation/lisibilté json
    //const presetRecuJson= JSON.stringify(req.body, null, 2); //req.body contient corps requete recue et stringify la parse en chaines JSON


    // 1) lire fichier "presets.json", err si erreur de lecture et param "data" = le contenu "lu"
    fs.readFile ('./presets.json','utf8', (err, data)=> {
        if (err)
        {
           return res.status(500).json({ erreur: "Erreur de lecture du fichier" });
        }

        const tabPresets =JSON.parse(data|| "[]"); // 2)parse le json lu en obj : "tab" JS, car le JSON local contient un tableau 
        
        //objet contenant le preset a save+ metadata
        const newPresetAndData = {
            id : tabPresets.length + 1,
            date : new Date().toLocaleString(),
            presetSettings : req.body
        };

        tabPresets.push(newPresetAndData); //3) on ajoute a la fin du tab : le nouveau preset save

    //4) parse du tab vers JSON clean
    const PresetsFullJSON = JSON.stringify(tabPresets,null,2);

    //5) on ecrase le fichier, avec ce JSON (avec les anciens +new preset save) dans le fichier local JSON
    //methode asynchrone js : ecriture fichiers, param 1=chemin file, param 2= donnes txt, param 3=callback pour log erreur ou sucess ecriture fichier
    fs.writeFile ('./presets.json', PresetsFullJSON, (err)=> 
        {
        //si callback write file, renvoie erreur, on envoie res avec code 500 err serveur, au client react
        if (err)
        {
            return res.status(500).json({erreur : "Erreur serveur, lors de la sauvegarde"});
        }
        console.log("Sauvegarde locale terminée")});

        // avec res.status express done code 200 ok automatiquement; au client
        // code 201 = ressource créée
        res.status(201).json({message: "Sauvegarde réussie"});
        });

    });

    
// pour garder serveur node allume et ecouté les requetes sur ce port
app.listen(PORT, () => {
    console.log(`Serveur Node.js démarré sur http://localhost:${PORT}`);
});