import  {etatSynth, musicKey} from "../types/synth";

export const etatInitSynth: etatSynth = {
    typeOnde : "sawtooth",
    freqeOsc :220,
    cutoff : 500,
    volume : 0.5,
    isPlaying : false,
    notePlayed: null
};

// declaration dobjets de type "musicKey"!, en type tableau
export const musicKeys : musicKey[] =[
{note : "DO", freq: 261.6, key :"a"},
{note : "RE", freq: 293.7, key :"z"},
{note : "MI", freq: 329.6,key :"e" },
{note : "FA", freq: 349.2, key :"r"},
{note : "SOL", freq: 392.0, key: "t"},
{note : "LA", freq: 440, key :"y"},
{note : "SI", freq: 493.88, key :"u"},
];
