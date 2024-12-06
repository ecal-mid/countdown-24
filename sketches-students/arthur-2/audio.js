

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
    Source1.source.frequency.value = 1000;
    Source1.source.type = "square";
    Source1.envelope.attack = 0.;
    Source1.envelope.decay = 0.001;
    Source1.envelope.sustain = 0.7;
    Source1.envelope.release = 0;
    Source1.gain.gain.value = 2.;
    Source1.filter.type = "lowpass";
    Source1.filter.frequency.value = 400;
    Source1.filter.rolloff = -12;

    const reverbe = new Tone.Reverb(2).toDestination();
    Source1.addEffect(reverbe);

    const Source2 = new Track();
    Source2.source.frequency.value = 1000;
    Source2.source.type = "sine";
    Source2.envelope.attack = 0.;
    Source2.envelope.decay = 0.1;
    Source2.envelope.sustain = 0.7;
    Source2.envelope.release = 0.;
    Source2.gain.gain.value = 0.1;
    Source2.filter.type = "lowpass";
    Source2.filter.frequency.value = 200;
    Source2.filter.rolloff = -12;

    const noise = new Tone.Noise("white").start();
    Source2.source = noise;
    Source2.nodes[0] = noise; // Update the first node in the chain to be the noise
    Source2.buildChain();

    let intervalIdA;
    let intervalIdB;

    let cubesAreFalling = 0;

    


    
    

    window.addEventListener('mousedown', (e) => {

        Source1.envelope.triggerAttackRelease(0.1);
        Source2.envelope.triggerAttackRelease(0.1);  
        Source2.filter.frequency.value = Math.random()*2000;

        let timeIntervals = [125, 250, 500, 1000];
            intervalIdA = setInterval(() => {
                Source1.envelope.triggerAttackRelease(0.1);  


            }, 500); 
            intervalIdB = setInterval(() => {

                Source2.envelope.triggerAttackRelease(0.1);  
                Source2.filter.frequency.value = Math.random()*2000;

            }, timeIntervals[Math.floor(Math.random()*timeIntervals.length)]); 
                
                Tone.start();
            Source1.source.start();
            Source2.source.start(0);

            console.log("a");
            //Source1.envelope.triggerAttack();   


        
    });

    window.addEventListener('mouseup', (e) => {
        
        clearInterval(intervalIdA);
        clearInterval(intervalIdB);
        
        Source1.envelope.triggerRelease();   

});

    window.addEventListener('cubesAreFalling', (e) => {
        if(cubesAreFalling==0){
            Source2.gain.gain.value = 0.;

            Source1.filter.frequency.value = 200;
            Source1.source.frequency.value = 100;
            Source1.source.type = "sawtooth";
            Source1.envelope.attack = 0.5;
            Source1.envelope.decay = 0.1;
            Source1.envelope.sustain = 0.7;
            Source1.envelope.release = 0.;
            Source1.gain.gain.value = 0.1;
            Source1.filter.type = "lowpass";

            //Source1.envelope.triggerAttackRelease("8n", +0.5);
        }
        cubesAreFalling = 1;
    });




}


function updateSeq(sequence){
    
    let notes = sequence.events;
    console.log(notes);
    notes.forEach((note, i) => {
        console.log(note);
        if(seqButtons[i].classList.contains('active')){
            console.log("active");
            notes[i] = "D3";
        }
        else{
            notes[i] = "";
        }
        console.log(notes);
    
    Source1.seq.events = notes;
    //console.log(Source1.seq.events);
    });

}

export{init}



    






        

