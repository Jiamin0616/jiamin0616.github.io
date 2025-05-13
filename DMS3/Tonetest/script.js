/* find modal close button and add an eventlistener */
document.getElementById("dialogCloseBtn").addEventListener("click", () => {
  document.getElementById("introDialog").close();
});

/* to get the backdrop working we need to trigger modal open with js */
document.getElementById("introDialog").showModal();

function toneInit() {
  mySynth.connect(myReverb);
  mySynth.toDestination();
//   mySynth.triggerAttackRelease("C4", "8n");
// }

let mySynth = new Tone.Synth();

let myReverb = new Tone.Reverb(10);  

let myPhaser = new Tone.Phaser(10, 0.9);

let synthButton = addEventListener(s"click", () => {

 mySynth.triggerAttackRelease("D2", "2n");
 setimer(() => 
}

document.getElementById("synthTriggerBtn", () => {});



/////////////// Representation of tone mental model ///////////////

/* 
Source          -------------->    Destination

Synthesizer     .toDesination()    Audio Driver ( => Audio Hardware )
Audio Player
*/

/* 
Trigger             ---------------------->   Source          

Pitch, Length       .triggerAttackRelease()   Synthesizer
Pitch, Start Time   .triggerAttack()      
End Time            .triggerRelease()

Start Playback      .start()                  Audio Player
Stop Playback       .stop()
*/

/* 
Source          --------->    Effect        -------------->    Destination

Synthesizer     .connect()    Reverb        .toDesination()    Audio Driver ( => Audio Hardware )
Audio Player                  Phaser        OR
                              Distortion    .connect()         Other Effect
                              etc
*/
