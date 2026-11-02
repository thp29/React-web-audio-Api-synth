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
                <img className="fader-icon" src="../assets/img/fader_icon.png" alt="" />
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
