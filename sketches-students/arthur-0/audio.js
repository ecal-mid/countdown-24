

class Track {
    constructor() {

        this.source = new Tone.Oscillator().start();

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
    Source1.source.frequency.value = 2000;
    Source1.source.type = "square";
    Source1.envelope.attack = 0.;
    Source1.envelope.decay = 0.001;
    Source1.envelope.sustain = 0.7;
    Source1.envelope.release = 0.;
    Source1.gain.gain.value = 0.5;
    Source1.filter.type = "highpass";
    Source1.filter.frequency.value = 200;
    Source1.filter.rolloff = -12;

    const delay = new Tone.FeedbackDelay(0.01,0.01).toDestination();
    Source1.addEffect(delay);

    const reverbe = new Tone.Reverb(2).toDestination();
    Source1.addEffect(reverbe);

    window.addEventListener('success',(e)=>{
       Source1.source.frequency.setValueAtTime(2000*1.5, Tone.now());
    });


    window.addEventListener('flash',()=>{

        console.log("flash");
        Source1.envelope.triggerAttackRelease(0.01);
    })

}




export{init}



    






        

