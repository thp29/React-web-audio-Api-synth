import "./style.css";

interface  etatSynth { // on verrouille la forme des données pour éviter les bugs de frappe.
    typeOnde : "sine" | "square" | "sawtooth" | "triangle";
    freqeOsc : number;
    cutoff : number;
    volume : number;
    isPlaying : boolean;
}

const etatInitSynth: etatSynth = {
    typeOnde : "sawtooth",
    freqeOsc :220,
    cutoff : 500,
    volume : 0.5,
    isPlaying : false
};

// tableaux d'objets (en TS) , pour stocker liste notes chromatique (sans notes alterees pour linstant!)
// 1 : structure de lobjet
interface musicKey {
    note : string;
    freq : number;
    key : string;
}

// declaration dobjets de type "musicKey"!, en type tableau
const musicKeys : musicKey[] =[
{note : "DO", freq: 261.6, key :"a"},
{note : "RE", freq: 293.7, key :"z"},
{note : "MI", freq: 329.6,key :"e" },
{note : "FA", freq: 349.2, key :"r"},
{note : "SOL", freq: 392.0, key: "t"},
{note : "LA", freq: 440, key :"y"},
{note : "SI", freq: 493.88, key :"u"},
];


interface ControlFaderProps { // composant react avec param de type "PROPS" = generique parent passe a enfant des propirete speciifques
    id : string;
    label : string;
    valeur : number; // valeur actuelle
    min : number;
    max : number;
    stepValue : number; // pas dincrementation du fader
    unite? : string; // "?" = optionnnel
    onChangeFader : (nouvelleValeur : number) => void; // pour changer valeur
}




import React, { useState } from "react";

import { useRef } from "react";
// useRef permet garder objet, sans provoquer de nouveau "rendu" visuel à chaque changement de lobjet , contrainement à useState

import { useEffect } from "react";



// composant control fAder 
// "React.FC" => Functional Component 
// "<>" en TS  => pour passer un type en paramètre (on appelle ça un type générique).
export const ControlFader: React.FC<ControlFaderProps> = ({
    id,
    label,
    valeur,
    min,
    max,
    stepValue,
    unite,
    onChangeFader,
}) => {
            // Ratio entre 0 et 1 (ex: 0 à gauche, 0.5 au milieu, 1 à droite)
        const ratio = (valeur - min) / (max - min);

        // On en déduit une luminosité : de 85% (très clair) à 25% (très sombre)
        const luminosite = 85 - ratio * 60;

    return (
        <section className="section-Fader">
            <label htmlFor={id}>
                <img className="fader-icon" src="fader_icon.png" alt="" />
                <span>{label}: {valeur} {unite}</span>
            </label>
            
                    <input
                        id={id}
                        type="range"
                        min={min}
                        max={max}
                        step={stepValue}
                        value={valeur}
                        onChange={(e) =>  onChangeFader(Number(e.target.value))}
                        style={{ '--thumb-lightness': `${luminosite}%` } as React.CSSProperties}
                    />
        </section>
    );
};


export const MiniSynthe = () => { // composant "react" , qui renvoie du jsx (psuedo html)
   
    // ZONE 1 : Les états (useState)
    const [etat, setEtat] = useState<etatSynth>(etatInitSynth); // fonction react qu on appelle avec param defaut "etatinitsynth" ici ! et retourne valeur de cet etat passe en param et une fonction pour changer cette donnee

    //Zone 1.1 les references audio (via userRef)
    const ctxWebAudioAPIRef = useRef <AudioContext | null>(null); // "audio context", de web audio API, = source clock pour audio et "calculs" audio -> ici = reference vers ojbet "moteur audio"
   // objet useRef, "ref" vers objet "noeud" = oscillateur
    const oscRef = useRef <OscillatorNode | null>(null); 
    // initiees a null car interdit au chargmetn page web, sans 1ere inteavyion user, de lancer son direct!
    const gainRef = useRef <GainNode | null>(null);

    // référence vers "noeud Web audio" filtre biquad
    const filterCutoffRef = useRef <BiquadFilterNode |null> (null);

    // ref react vers volume pour debug volume quand appui touche clavier via UseEffect, qui prend en compte letat init du "synth" au 1ER "lancement du composant "synth""!"
    const volumeRef = useRef <number>(etatInitSynth.volume);


    // ZONE 2 : Les fonctions d'actions et la logique
   
     const initSyntheAudio = (): void => {
        // Si la boîte n'est pas vide, le moteur est déjà prêt : on ne fait rien
    if (ctxWebAudioAPIRef.current !== null) {
        return;
    }

        // 1. Création des nœuds audio natifs
        const ctx_audio = new AudioContext();
        const osc = ctx_audio.createOscillator();
        const filtre = ctx_audio.createBiquadFilter();
        const gain = ctx_audio.createGain();

        osc.type = etat.typeOnde;
        osc.frequency.value = etat.freqeOsc;

        // init filtre
        filtre.type= "lowpass";
        filtre.frequency.value=etat.cutoff;

        // 2. Branchements , chemin du signal
        osc.connect(filtre);
        filtre.connect(gain);
        gain.connect(ctx_audio.destination);

        //demaree osc et fixe gain (par default à 100%)

        osc.start();
        gain.gain.value=0;

        // 3. Sauvegarde dans nos boîtes useRef pour plus tard
        ctxWebAudioAPIRef.current =ctx_audio;
        oscRef.current= osc;
        gainRef.current=gain;
        filterCutoffRef.current=filtre;        
    }


// jouer note si note encleche par user
   const jouerNote = (freqSelKey : number): void => {

        initSyntheAudio();

    
        //setEtat({...etat,freqeOsc : freqSelKey});

//quand "new AudioContext()" =>, les navigateurs le placent souvent par défaut dans l'état "suspended" (en pause) tant qu'il n'est pas réveillé explicitement.
            if (ctxWebAudioAPIRef.current && ctxWebAudioAPIRef.current.state === "suspended") {
                ctxWebAudioAPIRef.current.resume();
            }

        if (ctxWebAudioAPIRef.current !== null && oscRef.current!==null && gainRef.current!==null) {
        
        // on change la freq du userref (= la reference vers objet "osc" web audio!)
        const oldOscFrequence = oscRef.current.frequency; //ancienne frequence de la refrence vers osc web audio, pas du composant react synthe
        let temps = ctxWebAudioAPIRef.current.currentTime;
        oldOscFrequence.cancelScheduledValues(temps);
        oldOscFrequence.setValueAtTime(oldOscFrequence.value, temps);
        oldOscFrequence.setTargetAtTime(freqSelKey,temps,0.02);

        // puis on ouvre son gain
        gainRef.current.gain.value=volumeRef.current;

        temps = ctxWebAudioAPIRef.current.currentTime;
        const gainAudio = gainRef.current.gain;

           // 1. On annule les transitions en cours pour ne pas les chevaucher
        gainAudio.cancelScheduledValues(temps);

            // 2. On ancre la valeur courante exacte
        gainAudio.setValueAtTime(gainAudio.value, temps);

            // 3. On applique la nouvelle cible avec une constante douce (20 ms)
        gainAudio.setTargetAtTime(volumeRef.current, temps, 0.02);

        //setEtat( {...etat, isPlaying:true});
        setEtat((prev) => ({ ...prev,freqeOsc:freqSelKey, isPlaying: true })); // on met a jour composant use ref avec nouvelle freq recue de cette note enclecnhée !
    }
   }

   // couper son quand "bouton" note "relaché par user"
   const arreterNote = () : void =>
   {
    if (gainRef.current !==null && ctxWebAudioAPIRef.current !== null )
        {

            const temps = ctxWebAudioAPIRef.current.currentTime;
            const gainAudio = gainRef.current.gain;

           // 1. On annule les transitions en cours pour ne pas les chevaucher
            gainAudio.cancelScheduledValues(temps);

            // 2. On ancre la valeur courante exacte
            gainAudio.setValueAtTime(gainAudio.value, temps);

            // 3. On applique la nouvelle cible avec une constante douce (20 ms)
            gainAudio.setTargetAtTime(0, temps, 0.02);

            setEtat((prev) => ({ ...prev, isPlaying: false}));
            //setEtat ( {...etat, isPlaying : false} );
        };
   }
   
   
    const changerVolume = (nouveauVolume: number): void => {
        // maj etat
        setEtat ( {...etat, volume : nouveauVolume } ); 
        //  fonction "set etat" de react on change le param voulu , -> de lobjet "etat" recupere juste avant par fonction "UseState"!, ici donc -> change letat de "etatinit synth"
     //  fonction "set etat" de react on change le param voulu , -> de lobjet "etat" recupere juste avant par fonction "UseState"!, ici donc -> change letat de "etatinit synth"


        //  on stocke "nouveau volume", si on a bouge fader, dans Ref Volume
        volumeRef.current =nouveauVolume;

     // pour MAJ gainref composant react , si on est en "play" donc pas dans fonction "Toogleplay" desssous, on doit quand meme pouvoir changer volume et que ca soit aussi pris en compte par le "noeud gain" et pas juste visuel !
        if (gainRef.current !==null && ctxWebAudioAPIRef.current !== null && etat.isPlaying)
        {

            const temps = ctxWebAudioAPIRef.current.currentTime;
            const gainAudio = gainRef.current.gain;

           // 1. On annule les transitions en cours pour ne pas les chevaucher
            gainAudio.cancelScheduledValues(temps);

            // 2. On ancre la valeur courante exacte
            gainAudio.setValueAtTime(gainAudio.value, temps);

            // 3. On applique la nouvelle cible avec une constante douce (20 ms)
            gainAudio.setTargetAtTime(nouveauVolume, temps, 0.02);

            setEtat ( {...etat, isPlaying : true} );
        };
    }

    const togglePlay = (): void => 
    {
        initSyntheAudio(); //pour init notre moteur audio et osc etc !
        
        // setEtat met a jour le "isPlaying" pas en direct !  attend la fin de l'exécution de ta fonction pour recalculer le composant.
        // on calcule la valeur future de "isPlaying" dans une constante locale temporaire :  
        const reelIsPlaying = !etat.isPlaying;

        if(gainRef.current !==null){ //verifier que notre noeud de gain dans useref a bien etre crée
            
            //quand "new AudioContext()" =>, les navigateurs le placent souvent par défaut dans l'état "suspended" (en pause) tant qu'il n'est pas réveillé explicitement.
            if (ctxWebAudioAPIRef.current && ctxWebAudioAPIRef.current.state === "suspended") {
                ctxWebAudioAPIRef.current.resume();
            }

            if (reelIsPlaying){
                gainRef.current.gain.value=etat.volume;
            }
            else{
                gainRef.current.gain.value=0;
                }
            setEtat ( {...etat, isPlaying : reelIsPlaying } );
        }

        // debug
        console.log("État du contexte :", ctxWebAudioAPIRef.current?.state);
        console.log("Valeur du gain :", gainRef.current?.gain.value);
    };


    // fonction pour gerer frequence cutoof , controlee par faderCutoff !
    const changerFreqOsc = (nouvelleFreq : number) : void => 
    {
       setEtat ( {...etat, freqeOsc : nouvelleFreq } ); // maj de freqosc, du composant visuel minisynthe !
       if (oscRef.current!==null && ctxWebAudioAPIRef.current!==null)
       {
        const oldOscFrequence = oscRef.current.frequency; //ancienne frequence de la refrence vers osc web audio, pas du composant react synthe
        const temps = ctxWebAudioAPIRef.current.currentTime;
        oldOscFrequence.cancelScheduledValues(temps);
        oldOscFrequence.setValueAtTime(oldOscFrequence.value, temps);
        oldOscFrequence.setTargetAtTime(nouvelleFreq,temps,0.02);
       }

    };

    const changerFreqCutoff  = (nouvelleFreq : number) : void => 
    {   
       setEtat ( {...etat, cutoff : nouvelleFreq } ); // maj du cutoff, du composant visuel minisynthe !
       if (filterCutoffRef.current!==null && ctxWebAudioAPIRef.current!==null)
       {
        const oldCutoff= filterCutoffRef.current.frequency; //ancienne frequence de la reférence vers osc web audio, pas du composant react synthe
        const temps = ctxWebAudioAPIRef.current.currentTime;
        oldCutoff.cancelScheduledValues(temps);
        oldCutoff.setValueAtTime(oldCutoff.value, temps);
        oldCutoff.setTargetAtTime(nouvelleFreq,temps,0.02); 
       }

    };


    // "hook react" de type useEffect, pour ecouter evenements sur fenetre globales (ici des keydown ou up, => touches clavier!=)
     useEffect(() => {
   
        // si touche enfoncee
      const gererToucheDown = (event: KeyboardEvent) => {
      if (event.repeat) return; // si event en boucle on sort

      const noteTrouvee = musicKeys.find((item) => item.key === event.key.toLowerCase());
    

      if (noteTrouvee) // si une dans tab "music key" parcoure par find, on trouve 1 touche enfoncee correspondant a une "note" possible
      {
        jouerNote(noteTrouvee.freq);
      }
      };

      // si touche plus enfoncee ! : 
    const gererToucheUp = (event: KeyboardEvent) => {
      if (event.repeat) return;

      const noteTrouvee = musicKeys.find((item) => item.key === event.key.toLowerCase());
    
      if (noteTrouvee)
      {
        arreterNote();
      }
      };
    
    window.addEventListener("keydown", gererToucheDown);
    window.addEventListener("keyup", gererToucheUp);

    // 2. Nettoyage : React appelle cette fonction si le composant disparaît
    return () => {
      window.removeEventListener("keydown", gererToucheDown);
      window.removeEventListener("keyup", gererToucheUp);
    };
  } , []); // 3. Le tableau vide [] signifie : "exécute ce bloc une seule fois au chargement"
   
    // ZONE 3 : Le rendu visuel (l'équivalent du HTML)
    // {} dans les accolades en JSX = -> code javascript
    return (
        <main className="synthe-container">
            <h1>My Web Audio Synth</h1>

            {/* Contrôle Play / Stop */}
            <section className="section-clavier">
                {    // dans cette section, on parcourt notre tablea de touche avec "map", paeametre "note" et pour chaque "note", on renvoie un btn JSX
                    musicKeys.map ((noteLue) => 
                    (
                        <button 
                        type="button" 
                        key= {noteLue.note} // key = proprioete exigee par React quand boucle genere des composants, pour qu ils aient un "id" unique, si besoin de les MAJ 
                        onMouseDown= {() => jouerNote(noteLue.freq)} 
                        onMouseLeave={arreterNote}
                        onMouseUp={arreterNote}
                        className={etat.isPlaying ? "btn-actif" : "btn-inactif"}>
                        {noteLue.note}    
                        </button>
                    ))
                }           
               
               { /*<button 
                    type="button" 
                    onClick={togglePlay} //Pas de addEventListener : on écrit directement l'attribut onClick={togglePlay}.
                    className={etat.isPlaying ? "btn-actif" : "btn-inactif"}
                >
                    {etat.isPlaying ? "STOP" : "Play"}
                </button> */}
            </section>

            <section className="reglages-section">
                {/* "controlFader" : 1 =Contrôle du volume */}
                <ControlFader
                id="fader-volume"
                label="Volume"
                valeur={Math.round(etat.volume * 100)}
                min={0}
                max={100}
                stepValue={1}
                unite="%"
                onChangeFader={(val) => changerVolume(val / 100)}
                />

                {/* controle de la frequence de losc*/}
                <ControlFader
                id="fader-frequence-osc"
                label="Fréquence de l'oscillateur"
                valeur={etat.freqeOsc}
                min={60}
                max={1000}
                stepValue={1}
                unite="Hz"
                onChangeFader={(nouvelleValeur) => changerFreqOsc(nouvelleValeur)}
                />

                {/* controle de la frequence de cutoff*/}
                <ControlFader
                id="fader-frequence-cutoff"
                label="Filtre Cutoff"
                valeur={etat.cutoff}
                min={50}
                max={5000}
                stepValue={10}
                unite="Hz"
                onChangeFader={(nouvelleValeur) => changerFreqCutoff(nouvelleValeur)}
                />

            </section>
           
        </main>
    );

};

