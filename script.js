let cameraData, phoneData, calendarData;

let cameraExtent;

let svg, phoneLineChart, cameraLineChart, circleChart, calendarChart, calendarText, circlesChart;

let toggle = false, knobVisibility = 0;

let eventsArray = ["Diwali/Deepavali", "Ramzan Id/Eid-ul-Fitar", "Christmas", "Republic Day", "Independence Day", "Holi", "Dussehra"];

let x, y, r;

Promise.all([
    d3.json('./assets/phoneData.json', d3.autoType),
    d3.json('./assets/cameraData.json', d3.autoType),
    d3.csv('./assets/calendar.csv', d3.autoType)
]).then(function(files){
  
  phoneData = files[0],
  cameraData = files[1];
  calendarData = files[2];
  
  cameraExtent = d3.extent(cameraData, d => d);

  let format = d3.timeFormat("%j");

  for(let i = 0; i < calendarData.length; i++){
    let tt = calendarData[i]["Date"].split('-');
    let dt = new Date(+tt[2], +tt[1] - 1, +tt[0]);
    calendarData[i]["Date"] = dt;
    calendarData[i]["Date2"] = +format(dt);
  }

//   console.log(calendarData);

  
  size = {width: 0.8 * window.innerWidth, height: 500};
  
  // Add X axis --> it is a date format
    x = d3.scaleLinear()
      .domain([0, 366])
      .range([0.05 * size.width, 2 * size.width]);

    // Add Y axis
    y = d3.scaleLinear()
      .domain([0, 587])
      .range([400, 100]);
  
  r = d3.scaleLinear()
      .domain([0, 587])
      .range([3, 40]);
  
  
  svg = d3.select('#chart')
              .attr("width", 0.8 * window.innerWidth)
              .attr("height", 500)
              .append("g")
              .attr("id", "idSVG");

    calendarChart = svg
    .append("g")
    .attr("id", "ticks")
    .selectAll("rect")
    .data(d3.filter(calendarData, d => d['Date'].getFullYear() == 2020))
    .enter().append("rect")
    .attr("x", d => x(d['Date2']))
    .attr("y", d => 40)
    .attr("width", d => ((eventsArray.includes(d.Name)) || d["NID"] == 1) ? 2 : 1)
    .attr("height", 410)
    .attr("fill", d => (eventsArray.includes(d.Name)) ? "orange" : (d["NID"] == 1) ? "dodgerBlue" : '#FF149366')
    .attr("opacity", 0.3)
    .on("mouseover", (d, i) => console.log(i));

    calendarText = svg
    .append("g")
    .selectAll("text")
    .data(d3.filter(calendarData, d => d['Date'].getFullYear() == 2020))
    .enter().append("text")
    .text(d => ((eventsArray.includes(d.Name)) || d["NID"] == 1) ? d.Name : null)
    .attr("x", d => x(d['Date2']))
    .attr("y", d => (eventsArray.includes(d.Name)) ? 30 : 470)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("fill", d => (eventsArray.includes(d.Name)) ? "orange" : (d["NID"] == 1) ? "dodgerBlue" : "gainsboro")
    .on("mouseover", (d, i) => console.log(i));
  
    // cameraLineChart = svg.append("g")
    //           .attr("id", "cameraLineID")
    //           .append("path")
    //           .datum(cameraData)
    //           .attr("fill", "none")
    //           .attr("stroke", "orange")
    //           .attr("stroke-width", 2)
    //           .attr("d", d3.line()
    //             .curve(d3.curveCardinal)
    //             .x((d, i) => x(i))
    //             .y(d => y(d) ));

  phoneLineChart = svg.append("g")
              .attr("id", "lineID")
              .attr("opacity", 0)
              .append("path")
              .datum(phoneData)
              .attr("fill", "#FF149311")
              .attr("stroke", "deeppink")
              .attr("stroke-width", 2)
              .attr("d", d3.area()
                .x((d, i) => x(i))
                .y0(d => y(d) )
                .y1(400));
  
  circleChart = svg.append("circle")
              .attr("id", "circleID")
              .attr("opacity", 0)
              .attr("fill", "white")
              .attr("opacity", 1)
              .attr("stroke", "none")
              .attr("r", 5);

    circlesChart = svg.append("g").attr("id", "circlesID")
    .selectAll("circle")
    .data(phoneData)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => x(i))
    .attr("cy", 250)
    .attr("r", d => r(d))
    .attr("fill", "#FF1493")
    .attr("opacity", 0.3)
    .on("mouseover", (d, i) => console.log(i));
  
  init();
});

//attach a click listener to a play button
document.querySelector('#playButton')?.addEventListener('click', async () => {
	await Tone.start(Tone.now());
    seq.start();
    Tone.Transport.start();
});

//attach a click listener to a play button
document.querySelector('#pauseButton')?.addEventListener('click', async () => {
    Tone.Transport.stop(Tone.now());
});

//attach a click listener to a play button
document.querySelector('#stopButton')?.addEventListener('click', async () => {
    tj = 0;
    gsap.to("#idSVG", {x: 0, duration: 0.3});
    
    gsap.to("#circleID", {cx: x(tj), cy: y(phoneData[tj]), duration: 0.3});
    Tone.Transport.stop();
});

document.querySelector('#chartButton')?.addEventListener('click', async () => {
    if(!toggle){
	    gsap.to('#lineID', {opacity : 1, duration: 0.4});
        gsap.to('#circleID', {opacity : 1, duration: 0.4});
    } else {
        gsap.to('#lineID', {opacity : 0, duration: 0.4});
        gsap.to('#circleID', {opacity : 0, duration: 0.4});
    }
        
    toggle = !toggle;
    knobVisibility = (knobVisibility == 0) ? 1 : 0;
});

let bgSynth, synth, noiseSynth, rNotes, notes, tj, tnote, seq, bgLoop;

function init() {
 bgSynth = new Tone.MembraneSynth().toDestination();
  bgSynth.volume.value = -6;

  synth = new Tone.Synth().toDestination();
  synth.volume.value = -6;

  calendarSynth = new Tone.Synth().toDestination();
  calendarSynth.volume.value = -20;

  noiseSynth = new Tone.NoiseSynth().toDestination();
  noiseSynth.volume.value = -6;
  
  rNotes = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1',
              'A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2',
              'A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3',
              'A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4',
              'A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5'];

  notes = [];
  
  function scale (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }
  
  for(let i = 0; i < 366; i++){
    let n = Math.floor(scale(phoneData[i], 0, 587, 7, rNotes.length));
    notes[i] = rNotes[n];
  }

  Tone.Transport.bpm.value = 130;
  
  // for(let i = 0; i < 366; i++)
  //   synth.triggerAttackRelease(notes[i], "8n");
  
  tj = 0;
  tnote = "8n";
  
  // gsap.to("#idSVG", {x: -366, duration: 30});

  seq = new Tone.Sequence((time, note) => {
    
    if(x(tj) > 0.5 * size.width){
      // console.log("-----");
      gsap.to("#idSVG", {x: (-x(tj) + 0.5 * size.width), duration: 0.3});
    }

    calendarChart.transition().duration(200)
                .attr("fill", (d, i) => (d.Date2 == tj) ? "white" : (eventsArray.includes(d.Name)) ? "orange" : (d["NID"] == 1) ? "dodgerBlue" : '#FF149366');

    circlesChart.transition().ease(d3.easeBounceOut).duration(400)
                .attr("fill", (d, i) => (i==tj) ? "white" : "#FF1493")
                .attr("r", (d,i) => (i==tj) ? r(d) * 2 : r(d))
                .attr("opacity", (d, i) => (i==tj) ? 1 : 0.3);
    
      gsap.to("#circleID", {cx: x(tj), cy: y(phoneData[tj]), opacity: knobVisibility, duration: 0.3});
    
    if(tj == 50){
      bgLoop.set({interval : "4n"});
      tnote = "4n";
    } else if (tj == 165){
      bgLoop.set({interval : "8n"});
      tnote = "4n";
    } else if (tj == 195){
      bgLoop.set({interval : "2n"});
      tnote = "8n";
    }

    if(tj > 333)
        bgLoop.stop(Tone.now());
    
    //   (cameraData[tj] > 3) ? noiseSynth.triggerAttackRelease("24n", time) : null;
    
      (phoneData[tj] == 0) ? null : synth.triggerAttackRelease(note, 0.5);

      if(d3.some(calendarData, d => d.Date2 == tj)){
        //   console.log("hereeee");
        calendarSynth.triggerAttackRelease('C4', "16n")
      }

      tj++;
      // console.log(tj);
    },
    notes,
    "8n"
  );
  
    // create a new tone loop
  bgLoop = new Tone.Loop(function(time) {
    // Run once per eighth note, 8n, & log the time
    // trigger synth note
    
    bgSynth.triggerAttackRelease("C1", tnote);
  }, "2n").start(0);

  seq.loop = false;
  seq.start();
}