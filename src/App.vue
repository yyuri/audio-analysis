<template>
  <v-app >
    <v-main>
      <audio src="@/assets/song2.mp3" id="audio" crossorigin="anonymous" ref="audio"></audio>
      <v-container fluid>
        <div
          class="text-h6 transition-swing text-center mt-6"
        >
          Analyze and Select samples from audio files
       </div>
       <div
         class="caption transition-swing text-center mb-6"
       >
         Yumeji's Theme sample data
      </div>
      <div class="d-flex justify-center mb-3 mt-1">
        <v-btn @click="selectable=true;pause();">Create sample</v-btn>
        <v-btn v-if="!playing" @click="play()" @keyup.prevent="(e) => event.preventDefault()" style="z-index:1" class="mt-n4 mx-n2 elevation-2" fab large >
          <v-icon large color="green darken-1">mdi-play</v-icon>
        </v-btn>
        <v-btn v-else @click="pause();" @keyup.prevent="(e) => event.preventDefault()" style="z-index:1" class="mt-n4 mx-n2 elevation-2" fab large >
          <v-icon large color="red darken-2">mdi-pause</v-icon>
        </v-btn>
        <v-btn style="z-index:0" @click="clearAll">Clean samples</v-btn>
      </div>
        <v-card  flat class="mx-auto my-auto" :width="width*0.7">

          <BarChart :height="190" :updateChart="updateBarChart" :dataarray="dataArray"/>

          <LineChart
          :chartData="data"
          :options="options"
          :range="range"
          :height="400"
          @setrange="setRange"
          @chartobject="overlayLayer" refs="chart" id="chart" @start="startSelection" @movement="movementSelection" @stop="stopSelection" :selectable="selectable"
          ref="linechart"
          @goToFrame="goToFrame"
          />

            <canvas id="overlay"
            width="1200"
            height="400"
            class="selectable"
            @mousedown="startSelection"
            @mousemove="movementSelection"
            @mouseup="stopSelection"
            ref="overlaychart"
            />


          <RangeSlider @setrange="setRange" :min="datasetstart" :max="datasetend" :width="width*0.9"/>

        </v-card>


      </v-container>

    </v-main>
  </v-app>
</template>

<script>
import BarChart from './components/BarChart.vue'
import RangeSlider from './components/RangeSlider.vue'
import LineChart from './components/LineChart.vue'

import moment from 'moment'

export default {
  name: 'App',
  components: {
    BarChart,
    LineChart,
    RangeSlider
  },
  data: () => ({
    options: {
      elements: {
          point:{
              radius: 0
          }
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            gridLines: {
              display: true,
              offsetGridLines: false,
            },
          }],
          xAxes: [{
            gridLines: {
              display: true,
              offsetGridLines: false,
              zeroLineWidth: 2,
              tickMarkLength: 5,

            },
            ticks: {
                padding: 10,
            }
          }]
      },
      legend: {
          display: false,
      },
      animation: {
        duration: 0
      }
    },
    data: {
      labels: [],
      datasets: [{
          label: 'Sonometria 1',
          data: [],
          fill: true,
        }
      ]
    },
    selectable: false,
    selectionRect: {
      w: 0,
      startX: 0,
      startY: 0,
      startIndex: null,
      stopIndex: null
    },
    overlay: null,
    labels: null,
    dataset: null,
    datasetstart: 0,
    datasetend: 360,
    range: [0,360],
    width: window.innerWidth,
    updateBarChart: false,
    backgroundcolor: 'hsla(2, 12%, 50%,0.4)',
    bordercolor: 'hsla(2, 12%, 50%,0.4)',
    rangeselections: [],
    dataArray: null,
    audio: null,
    source: null,
    analyser: null,
    analyserinterval: null,
    starty: null,
    stopy: null,
    chartwidth: null,
    motion: null,
    playing: false,
    overlaybtn: true,
  }),
  mounted () {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.audio = document.querySelector('audio');
    this.source = audioCtx.createMediaElementSource(this.audio);

    let _this = this;

    // We fetch then process the file, we get Db levels of the whole audiofile

    fetch(require('@/assets/song2.mp3'))
      .then(function(resp) {return resp.arrayBuffer()})
      .then(audioCtx.decodeAudioData.bind(audioCtx))
      .then(function(buffer) {
        let channel = buffer.getChannelData(0);

        let points = [0];
        let duration = buffer.duration;

        for(let x = 1, i, v; x < duration; x++) {
          i = ((x / duration) * channel.length)|0;
          v = Math.abs(getdB(channel, i, 440));
          points.push(v);
        }
        _this.setProccessedData(duration,points);
        // calculates RMS per window and returns normalized dB
        function getdB(buffer, pos, winSize) {
          let sum = 0;
          for(let v, i = pos - winSize; i <= pos; i++) {
            v = i < 0 ? 0 : buffer[i];
            sum += v * v;
          }
          let rms = Math.sqrt(sum / winSize);  // corrected!
          return .4*Math.log10(rms);
        }
    });

    //Create analyser, connect it to source and destination and create buffer array
    this.analyser = audioCtx.createAnalyser();
    this.source.connect(this.analyser);
    this.analyser.connect(audioCtx.destination);
    this.analyser.smoothingTimeConstant= 0.7
    this.analyser.fftSize = 64; //Sample rate is 44100hz, we have enough accuracy with 64 .



    //We are adding keydown control
    window.addEventListener('keydown', this.switcher);
  },
  destroyed () {
    window.removeEventListener('keydown', this.switcher);
  },
  methods: {
    switcher(e) {
      if(e.code === 'Space') {
        if(this.audio.paused) {
          this.play();
        }
        else {
          this.pause();
        }
      }
      else if(e.code === 'ArrowRight') {
        this.audio.currentTime += 3;
        let x = this.chartwidth*this.audio.currentTime / this.source.mediaElement.duration ;
        this.overlay.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
        this.overlay.fillRect(x,this.starty,-6,this.stopy);
      }
      else if(e.code === 'ArrowLeft') {
        this.audio.currentTime -= 3;
        let x = this.chartwidth*this.audio.currentTime / this.source.mediaElement.duration ;
        this.overlay.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
        this.overlay.fillRect(x,this.starty,-6,this.stopy);
      }
    },
    play() {
      this.playing = true;
      this.audio.play();

      //let labels = ["20Hz", "25 Hz", "31.5 Hz", "40 Hz", "50 Hz", "63 Hz", "80 Hz", "100 Hz", "125 Hz", "160 Hz", "200 Hz", "250 Hz", "315 Hz", "400 Hz", "500 Hz", "630 Hz", "800 Hz", "1000 Hz", "1250 Hz", "1600 Hz", "2000 Hz", "2500 Hz", "3150 Hz", "4000 Hz", "5000 Hz", "6300 Hz", "8000 Hz", "10 kHz", "12,5 kHz", "16 kHz", "20 kHz"];
      this.analyserinterval = setInterval(() => {
        let buffer = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(buffer);
        this.analyser.getByteFrequencyData(this.dataArray);
        this.updateBarChart = !this.updateBarChart;
      }, 90);
      this.motion = window.requestAnimationFrame(this.progressBar)
      //this.motion = window.requestAnimationFrame(this.progressBar);
    },
    pause() {
      this.playing = false;
      this.audio.pause();
      clearInterval(this.analyserinterval);
      window.cancelAnimationFrame(this.motion);
    },
    goToFrame(point) {
      if(!this.selectable) {
        this.audio.currentTime= (point._index+this.range[0]);
        let x = (point._index/(this.range[1]-this.range[0])) * this.chartwidth;
        this.overlay.globalAlpha = 0.5;
        this.overlay.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
        this.overlay.fillRect(x,this.starty,-6,this.$refs.linechart._data._chart.scales['x-axis-0'].top-7);
      }
    },
    progressBar() {
      if(!this.audio.paused) {
          let x = ((this.source.mediaElement.currentTime-this.range[0]) / (this.range[1]-this.range[0])) * this.chartwidth;
          this.overlay.globalAlpha = 0.5;
          this.overlay.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
          this.overlay.fillRect(x,this.starty,-6,this.$refs.linechart._data._chart.scales['x-axis-0'].top-7);
          window.requestAnimationFrame(this.progressBar)
      }
      else {
        let x = ((this.source.mediaElement.currentTime-this.range[0]) / (this.range[1]-this.range[0])) * this.chartwidth;
        this.overlay.globalAlpha = 0.5;
        this.overlay.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
        this.overlay.fillRect(x,this.starty,-6,this.$refs.linechart._data._chart.scales['x-axis-0'].top-7);
      }
    },
    setProccessedData(duration,points) {
      this.datasetend = Math.floor(duration);
      this.range = [0,Math.floor(duration)];
      this.labels = this.dBLabels();
      this.dataset = this.dBData(points);
      this.backgroundcolor = 'hsl(0, 0%, 53%,0.2)'
      this.data = {
        labels: this.labels,
        datasets: [{
            label: 'Sonometria 1',
            data: this.dataset,
            borderColor: this.bordercolor,
            backgroundColor: this.backgroundcolor,
            borderWidth: 2,
            fill: true,
          },
        ]
      }
    },
    dBData(points) {
      let data = [];
      for(let i=this.datasetstart; i<this.datasetend; i++) {
        data.push(points[i]);
      }
      return data
    },
    dBLabels() {
      let labels = [];
      for(let i=this.datasetstart; i<this.datasetend; i++) {
        labels.push(moment().startOf('day').add(1*i, 'seconds').format('H:mm:ss'))
      }
      return labels
    },
    clearAll() {
      let labels = this.labels.slice(this.range[0], this.range[1]+1);
      let dataset = this.dataset.slice(this.range[0],this.range[1]+1);
      this.rangeselections = [];
      this.data = {
        labels: labels,
        datasets: [{
            label: 'Sonometria 1',
            data: dataset,
            borderColor: this.bordercolor,
            borderWidth: 2,
            backgroundColor: this.backgroundcolor,
            fill: true
          }
        ]
      };
    },
    setRange(a) {
      let start = a[0];
      let end = a[1];
      this.range = a;
      let labels = this.labels.slice(start, end+1);
      let datasets = [];
      datasets.push(this.dataset.slice(start,end+1));
      for(let i=0; i<this.rangeselections.length; i++) {
        let selection = this.dataset.slice(this.rangeselections[i],this.rangeselections[i+1]+1);
        let firstpart = Array(this.rangeselections[i]).fill(null);
        let secondpart = Array(this.datasetend-this.rangeselections[i+1]).fill(null);
        let d = firstpart.concat(selection).concat(secondpart)
        datasets.push(d.slice(start,end+1));
        i = i+1;
      }
      let backgrounds = [this.backgroundcolor, "#FDD8358C", "#B39DDB8C", "#9FA8DA8C", "#EF9A9A8C", "#F48FB18C", "#CE93D88C",'#80CBC48C','#BCAAA48C']
      let sliceddatasets = [];
      for(let i=0;i<datasets.length;i++) {
        sliceddatasets.push(
          {
            data: datasets[i],
            borderColor: this.bordercolor,
            backgroundColor: backgrounds[i%backgrounds.length],
            borderWidth: 2,
            fill: true
          }
        )
      }
      this.data = {
        labels: labels,
        datasets: sliceddatasets
      };
      let x = ((this.source.mediaElement.currentTime-this.range[0]) / (this.range[1]-this.range[0])) * this.chartwidth;
      this.overlay.globalAlpha = 0.5;
      this.overlay.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
      this.overlay.fillRect(x,this.starty,-6,this.$refs.linechart._data._chart.scales['x-axis-0'].top-7);
    },
    //This next three functions are handling user inputs when selecting areas of the chart
    startSelection(e,point) {
      this.selectionRect.startIndex = point._index+this.range[0];
      this.selectionRect.startX = point._view.x;
      this.selectionRect.startY = this.starty;
    },
    movementSelection(evt,drag,point) {
      if (drag && this.selectionRect.stopIndex !== point._index && this.selectionRect.startIndex !== null) {
        this.selectionRect.stopIndex = point._index+this.range[0];
        this.selectionRect.w = (point._view.x) - this.selectionRect.startX;
        this.overlay.globalAlpha = 0.5;
        this.overlay.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
        this.overlay.fillRect(this.selectionRect.startX-34,
          this.starty,
          this.selectionRect.w,
          this.stopy);
      }
      else if(this.selectionRect.startIndex == null) {
        this.overlay.globalAlpha = 0.5;
        let x = point._view.x;
        console.log(x)
        console.log(point._index)

        this.overlay.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
        this.overlay.fillRect(x-34,this.starty,2,this.stopy);
      }
    },
    stopSelection() {
      this.overlay.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
      this.addNewSelection(Math.min(this.selectionRect.startIndex,this.selectionRect.stopIndex), Math.max(this.selectionRect.startIndex,this.selectionRect.stopIndex) )
      this.selectionRect = {
        w: 0,
        startX: 0,
        startY: 0,
        startIndex: null,
        stopIndex: null
      };
      this.selectable = false;


    },
    addNewSelection(min,max) {
      this.rangeselections.push(min);
      this.rangeselections.push(max);
      this.setRange(this.range);
      this.audio.currentTime= (min);
      let x = ((min-this.range[0]) / (this.range[1]-this.range[0])) * this.chartwidth;
      this.overlay.globalAlpha = 0.5;
      this.overlay.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height);
      this.overlay.fillRect(x,this.starty,-6,this.$refs.linechart._data._chart.scales['x-axis-0'].top-7);
    },
    overlayLayer(e) {
      const c = document.getElementById('overlay');

      c.style.position = "absolute";
      c.style.top = e.canvas.offsetTop+'px';
      c.style.left = '33px';

      const ctx = c.getContext("2d");
      ctx.canvas.width = e.chart.width-33;
      ctx.canvas.height = e.chart.height;
      this.starty = e.chart.scales['y-axis-0'].top
      this.stopy = e.chart.scales['y-axis-0'].bottom-37
      this.chartwidth = e.chart.chartArea.right - e.chart.chartArea.left+5
      this.overlay = ctx;
    }
  }
}
</script>

<style>
.selectable {
  pointer-events:none;
}
</style>
