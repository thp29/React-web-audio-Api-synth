## Fonctionnalités : 

- **Chaîne audio:** Oscillateur =>  Filtre passe-bas => Étage de gain => Sortie.
- **Clavier musical 7 notes :** Déclenchement dynamique (*Note On* / *Note Off*) des notes tempérées de la gamme de Do majeur (DO, RÉ, MI, FA, SOL, LA, SI).
- ** Lissage des variations d'amplitude et de fréquence via `setTargetAtTime`, pour éviter les "clics" numériques

- **Faders de contrôle personnalisés (`ControlFader`) :**
  - Contrôle du volume général ($0$ à $100\,\%$).
  - Fréquence de base de l'oscillateur ($60$ à $1000\text{ Hz}$).
  - Fréquence de coupure du filtre passe-bas ($50$ à $5000\text{ Hz}$).

---

## Architecture technique

### 1. La chaîne de signal audio :

```text
[ OscillatorNode ] ---> [ BiquadFilterNode ] ---> [ GainNode ] ---> [ AudioDestinationNode ]

				           (Filtre Lowpass)          (Volume)                (Sortie)
2. Séparation React vs Web Audio
(valeurs affichées sur les faders, état de jeu) pour piloter les rendus graphiques.

useRef : Conserve les instances des nœuds audio natifs (AudioContext, OscillatorNode, BiquadFilterNode, GainNode)


Technologies employées : 

React 18 & TypeScript

Web Audio API (moteur natif du navigateur)

Vite (outillage de build et serveur de développement)

CSS3 moderne 


Évolutions prévues
[ ] Support du clavier physique d'ordinateur (touches AZERTY via useEffect).

[ ] Enveloppe d'amplitude ADSR complète (Attack, Decay, Sustain, Release).

[ ] Choix de la forme d'onde

[ ] Sauvegarde de presets utilisateur, en local via Node JS


