

class Track {
    constructor() {

        this.source = new Tone.Oscillator();

        this.envelope = new Tone.AmplitudeEnvelope({
            attack: 0.,
            decay: 0.1,
            sustain: 1.0,
            release: 0.
        })

        this.gain = new Tone.Gain(0.1)

        this.filter = new Tone.Filter(200, "allpass")

        this.nodes = [this.source, this.envelope, this.gain, this.filter]

        this.buildChain();

        this.effects = [];

        
        
    }

    

    buildChain(){
        
        this.nodes.forEach((element,i) => {
            if(i < this.nodes.length - 1){
                element.connect(this.nodes[i+1]);
            } else {
                element.toDestination();
            }
            
        });
    }

    addEffect(effect){
        this.nodes.push(effect); // Add the effect to the nodes array
    
    // Dynamically create a property on the parent object
    if (effect.name) {
        this[effect.name] = effect;
    } else {
        console.warn("Effect does not have a 'name' property.");
    }
    this.buildChain();
    }

    removeEffect(effect){
        let index = this.nodes.indexOf(this[effect]);
        if(index != -1){
            this.nodes.splice(index, 1);
        }
        this.buildChain();
    }

    setNodePosition(node, position) {
        let index = this.nodes.indexOf(node);
        console.log(index);
        if (index !== -1) {
            this.nodes[index].disconnect(); // Disconnect the node from the chain
            this.nodes.splice(index, 1); // Remove the node from its current position
            if (position === 'first') {
                this.nodes.unshift(node); // Add the node to the beginning of the array
            } else if (position === 'last') {
                this.nodes.push(node); // Add the node to the end of the array
            }
            this.buildChain(); // Rebuild the chain to reflect the new order

        } else {
            console.warn("Node not found in the nodes array.");
        }
    };
}

function getRandomCMajorNoteFrequency() {
    // Frequencies for C Major scale in one octave (C4 to B4)
    const cMajorScale = {
        C4: 261.63,
        D4: 293.66,
        E4: 329.63,
        F4: 349.23,
        G4: 392.00,
        A4: 440.00,
        B4: 493.88,
    };
    
    // Get an array of note names
    const notes = Object.keys(cMajorScale);
    
    // Select a random note
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    
    // Return the frequency of the random note
    return cMajorScale[randomNote];
}

function init(){
    const Source1 = new Track();
    Source1.source.frequency.value = 30;
    Source1.source.type = "square";
    Source1.envelope.attack = 0.9;
    Source1.envelope.decay = 0.1;
    Source1.envelope.sustain = 0.7;
    Source1.envelope.release = 1.;
    Source1.gain.gain.value = 4.;
    Source1.filter.type = "lowpass";
    Source1.filter.frequency.value = 400;
    Source1.filter.rolloff = -12;
    

    const filterLFO = new Tone.LFO(1, 100, 200);
    filterLFO.connect(Source1.filter.frequency);
    console.log(Source1);

    const pitchLFO = new Tone.LFO(1, 15, 20);
    pitchLFO.connect(Source1.source.frequency);
    console.log(Source1);

    // const reverse = new Tone.FeedbackDelay(0.001, 0.8).toDestination(); 
    // Source1.addEffect(reverse);

    const reverbe =     new Tone.Reverb(2).toDestination();
    Source1.addEffect(reverbe);


    // const delay = new Tone.FeedbackDelay("16n", 0.5).toDestination();
    // Source1.addEffect(delay);

    // s
    


    //Source1.removeEffect("envelope");
    console.log(Source1);

    window.addEventListener('mousedown', (e) => {
        
            Tone.start();
            Source1.source.start();
            filterLFO.start();
            pitchLFO.start();
            console.log("a");
            Source1.envelope.triggerAttack();   


        
    });

    window.addEventListener('mouseup', (e) => {
        
        
        
        Source1.envelope.triggerRelease();   


    
});

}




export{init}



    






        

