export interface  etatSynth { // on verrouille la forme des données pour éviter les bugs de frappe.
    typeOnde : "sine" | "square" | "sawtooth" | "triangle";
    freqeOsc : number;
    cutoff : number;
    volume : number;
    isPlaying : boolean;
}



// tableaux d'objets (en TS) , pour stocker liste notes chromatique (sans notes alterees pour linstant!)
// 1 : structure de lobjet
export interface musicKey {
    note : string;
    freq : number;
    key : string;
}

