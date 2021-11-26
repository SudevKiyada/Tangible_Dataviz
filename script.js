Promise.all([
    d3.json('./assets/phoneData.json', d3.autoType),
    d3.json('./assets/cameraData.json', d3.autoType),
]).then(function(files){
  
  let phoneData = files[0],
      cameraData = files[1];
  
  let cameraExtent = d3.extent(cameraData, d => d);

  
  let size = {width: 0.8 * window.innerWidth, height: 500};
  
  // Add X axis --> it is a date format
    const x = d3.scaleLinear()
      .domain([0, 366])
      .range([0.05 * size.width, 2 * size.width]);

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 587])
      .range([400, 100]);
  
  const r = d3.scaleLinear()
      .domain([0, 587])
      .range([5, 10]);
  
  
  let svg = d3.select('#chart')
              .attr("width", 0.8 * window.innerWidth)
              .attr("height", 500)
              .append("g")
              .attr("id", "idSVG");
  
  let phoneLineChart = svg.append("g")
              .attr("id", "lineID")
              .append("path")
              .datum(phoneData)
              .attr("fill", "none")
              .attr("stroke", "deeppink")
              .attr("stroke-width", 2)
              .attr("d", d3.line()
                .curve(d3.curveCardinal)
                .x((d, i) => x(i))
                .y(d => y(d) ));
  
  let cameraLineChart = svg.append("g")
              .attr("id", "lineID")
              .append("path")
              .datum(cameraData)
              .attr("fill", "none")
              .attr("stroke", "orange")
              .attr("stroke-width", 2)
              .attr("d", d3.line()
                .curve(d3.curveCardinal)
                .x((d, i) => x(i))
                .y(d => y(d) ));
  
  let circleChart = svg.append("circle")
              .attr("id", "circleID")
              .attr("fill", "dodgerBlue")
              .attr("opacity", 0.5)
              .attr("stroke", "none")
              .attr("r", 5);
  
  const bgSynth = new Tone.MembraneSynth().toDestination();
  bgSynth.volume.value = -6;
  const synth = new Tone.Synth().toDestination();
  synth.set({
	"volume": 0,
	"detune": 0,
	"portamento": 0,
	"envelope": {
		"attack": 0.001,
		"attackCurve": "linear",
		"decay": 0.01,
		"decayCurve": "exponential",
		"release": 4,
		"releaseCurve": "exponential",
		"sustain": 0.3
	},
	"oscillator": {
		"partialCount": 0,
		"partials": [],
		"phase": 0,
		"type": "triangle"
	}
});
  synth.volume.value = -6;
  const noiseSynth = new Tone.NoiseSynth().toDestination();
  noiseSynth.volume.value = -6;
  
  let rNotes = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1',
              'A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2',
              'A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3',
              'A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4',
              'A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5'];

  let notes = [];
  
  function scale (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }
  
  for(let i = 0; i < 366; i++){
    let n = Math.floor(scale(phoneData[i], 0, 587, 0, rNotes.length));
    notes[i] = rNotes[n];
  }

  Tone.Transport.bpm.value = 130;
  
  // for(let i = 0; i < 366; i++)
  //   synth.triggerAttackRelease(notes[i], "8n");
  
  let tj = 0;
  let tnote = "8n";
  
  // gsap.to("#idSVG", {x: -366, duration: 30});

  const seq = new Tone.Sequence((time, note) => {
    
    if(x(tj) > 0.5 * size.width){
      // console.log("-----");
      gsap.to("#idSVG", {x: (-x(tj) + 0.5 * size.width), duration: 0.1});
    }
    
      gsap.to("#circleID", {cx: x(tj), cy: y(phoneData[tj]), duration: 0.1});
    
    if(tj == 50){
      bgLoop.set({interval : "2n"});
      tnote = "8n";
    } else if (tj == 170){
      bgLoop.set({interval : "4n"});
      tnote = "8n";
    } else if (tj == 190){
      bgLoop.set({interval : "2n"});
      tnote = "8n";
    }
    
      (cameraData[tj] > 3) ? noiseSynth.triggerAttackRelease("24n", time) : null;
    
      (phoneData[tj] == 0) ? null : synth.triggerAttackRelease(note, 1.0);
      tj++;
      // console.log(tj);
    },
    notes,
    "8n"
  );
  
    // create a new tone loop
  const bgLoop = new Tone.Loop(function(time) {
    // Run once per eighth note, 8n, & log the time
    // trigger synth note
    
    if(tj == 50){
      bgLoop.set({interval : "4n"});
      tnote = "8n";
    } else if (tj == 170){
      bgLoop.set({interval : "12n"});
      tnote = "4n";
    } else if (tj == 190){
      bgLoop.set({interval : "2n"});
      tnote = "8n";
    }
    
    bgSynth.triggerAttackRelease("C1", tnote);
  }, "2n").start(0);

  seq.loop = false;
  seq.start();
  Tone.Transport.start();
  
  // console.log(data);
});

