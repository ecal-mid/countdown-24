

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

function init(){


    const Source1 = new Track();
    const noise = new Tone.Noise("brown").start();
    let ramp = 4.
    Source1.source = noise;
    Source1.envelope.attack = ramp;
    Source1.envelope.decay = 0.1;
    Source1.envelope.sustain = 0.7;
    Source1.envelope.release = ramp;
    Source1.gain.gain.value = 0.3;
    Source1.filter.type = "highpass";
    Source1.filter.frequency.value = 200;
    Source1.filter.rolloff = -12;

    Source1.envelope.connect(Source1.filter.frequency);

    //const bitCrusher = new Tone.BitCrusher(4);
    //Source1.addEffect(bitCrusher);


    
    
    Source1.nodes[0] = noise; // Update the first node in the chain to be the noise
    Source1.buildChain(); // Rebuild the chain to reflect the new source

    const Source2 = new Track();
    const kick = new Tone.MembraneSynth().toDestination();
    Source2.source = kick;
    Source2.envelope.attack = 0.6;
    Source2.envelope.decay = 0.2;
    Source2.envelope.sustain = 0.2;
    Source2.envelope.release = 0.5;
    Source2.gain.gain.value = 0.5;
    Source2.filter.type = "lowpass";
    Source2.filter.frequency.value = 100;
    Source2.filter.rolloff = -24;

    Source2.envelope.connect(Source2.filter.frequency);

    Source2.nodes[0] = kick; // Update the first node in the chain to be the kick
    Source2.buildChain(); // Rebuild the chain to reflect the new source

    function handleClick() {
        console.log(Source1);
        setTimeout(()=>{
            Source1.envelope.triggerAttackRelease(4);
        },1000)
        window.removeEventListener("click", handleClick);
    }

    window.addEventListener("click", handleClick);

    let isKicked = false;

    window.addEventListener('kick',()=>{
        //if(!isKicked)Source2.source.triggerAttackRelease("C1", "2n");
        isKicked = true;
    })


}

export{init}



    






        

