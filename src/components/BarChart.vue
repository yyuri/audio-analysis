<script>
import { Bar } from 'vue-chartjs'
export default {
  extends: Bar,
  props: ['updateChart', 'dataarray'],
  data: () => ({
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
          display: false,
      },
      scales: {
        yAxes: [
          {
            gridLines: {
              display: true,
              offsetGridLines: false,
            },
            ticks: {
                min: 0,
                max: 255,
                stepSize: 15
            }
          }],
          xAxes: [{
            gridLines: {
              display: false,
              offsetGridLines: false,
            },
          }]
      },
      animation: {
        duration: 0,
      }
    },
    data: {
      labels: ["20Hz", "25 Hz", "31.5 Hz", "40 Hz", "50 Hz", "63 Hz", "80 Hz", "100 Hz", "125 Hz", "160 Hz", "200 Hz", "250 Hz", "315 Hz", "400 Hz", "500 Hz", "630 Hz", "800 Hz", "1000 Hz", "1250 Hz", "1600 Hz", "2000 Hz", "2500 Hz", "3150 Hz", "4000 Hz", "5000 Hz", "6300 Hz", "8000 Hz", "10 kHz", "12,5 kHz", "16 kHz", "20 kHz"],
      datasets: [{
          label: `dB(A)`,
          data: [7, 11, 5, 8, 3, 7],
          borderWidth: 1
        }
      ]
    },
    colors: null,
  }),
  mounted () {
    this.getArrayOfColors();
    let randomArray = [];
    for(let i = 0; i<31; i++) randomArray.push(Math.floor(Math.random() * 100));
    this.data = {
      labels: ["20Hz", "25 Hz", "31.5 Hz", "40 Hz", "50 Hz", "63 Hz", "80 Hz", "100 Hz", "125 Hz", "160 Hz", "200 Hz", "250 Hz", "315 Hz", "400 Hz", "500 Hz", "630 Hz", "800 Hz", "1000 Hz", "1250 Hz", "1600 Hz", "2000 Hz", "2500 Hz", "3150 Hz", "4000 Hz", "5000 Hz", "6300 Hz", "8000 Hz", "10 kHz", "12,5 kHz", "16 kHz", "20 kHz"],
      datasets: [{
          label: `dB(A)`,
          data: this.dataarray,
          borderColor: '#222222',
          borderWidth: 1,
          backgroundColor: this.colors
        }
      ]
    },
    this.renderChart(this.data, this.options)
  },
  destroyed() {
  },
  methods: {
    randomNum() {
      return Math.floor(Math.random() * 100);
    },
    waveToHue(l) {
      let hue = (270*(650-l))/250;
      let light = (270*(700-l))/250;
      return hue > 0 ? 'hsl('+hue+','+light+'50%,50%)' : 'hsl(0,50%,50%)';
    },
    getArrayOfColors() {
      let soundfreq = [20, 25, 31, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12000, 16000, 20000]
      let intervals = (620-350)/(soundfreq.length+1);
      let colors = [];
      //color is made by an equivalency scale between Light Wavelength and Audiblesound-wavelength
      for(let i=0; i<soundfreq.length;i++) {
        colors.push(this.spectral_color(420+i*intervals))
      }
      this.colors = colors;
    },
    //Returns a vertical linearGradient with 3 steps, white - color - black
    spectral_color(l)
      {
        let t=0;
        let r=0;
        let g=0;
        let b=0;
             if ((l>=400.0)&&(l<410.0)) { t=(l-400.0)/(410.0-400.0); r=+(0.33*t)-(0.20*t*t); }
        else if ((l>=410.0)&&(l<475.0)) { t=(l-410.0)/(475.0-410.0); r=0.14-(0.13*t*t); }
        else if ((l>=545.0)&&(l<595.0)) { t=(l-545.0)/(595.0-545.0); r=+(1.98*t)-(t*t); }
        else if ((l>=595.0)&&(l<650.0)) { t=(l-595.0)/(650.0-595.0); r=0.98+(0.06*t)-(0.40*t*t); }
        else if ((l>=650.0)&&(l<700.0)) { t=(l-650.0)/(700.0-650.0); r=0.65-(0.84*t)+(0.20*t*t); }
             if ((l>=415.0)&&(l<475.0)) { t=(l-415.0)/(475.0-415.0); g=+(0.80*t*t); }
        else if ((l>=475.0)&&(l<590.0)) { t=(l-475.0)/(590.0-475.0); g=0.8 +(0.76*t)-(0.80*t*t); }
        else if ((l>=585.0)&&(l<639.0)) { t=(l-585.0)/(639.0-585.0); g=0.84-(0.84*t); }
             if ((l>=400.0)&&(l<475.0)) { t=(l-400.0)/(475.0-400.0); b=+(2.20*t)-(1.50*t*t); }
        else if ((l>=475.0)&&(l<560.0)) { t=(l-475.0)/(560.0-475.0); b=0.7-(t)+(0.30*t*t); }

        let [hue,saturation,light] = rgbToHsl(Math.round(254*r),Math.round(254*g),Math.round(254*b));
        let background = this.$refs.canvas.getContext('2d').createLinearGradient(0, 0, 0, 170);
        background.addColorStop(0, 'hsl('+hue+','+0.1*saturation+'%,'+light+'%)');
        background.addColorStop(0.3, 'hsl('+hue+','+0.3*saturation+'%,'+light+'%)');
        background.addColorStop(1, 'hsl(214, 21%, 45%)');

        function rgbToHsl(r, g, b) {
          r /= 255, g /= 255, b /= 255;
          let max = Math.max(r, g, b), min = Math.min(r, g, b);
          let h, s, l = (max + min) / 2;
          if (max == min) {
              h = s = 0; // achromatic
          }
          else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
          }
          return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
        }
        return background;
    },
  },
  watch: {
    updateChart() {
        this.data = {
          labels: ["20Hz", "25 Hz", "31.5 Hz", "40 Hz", "50 Hz", "63 Hz", "80 Hz", "100 Hz", "125 Hz", "160 Hz", "200 Hz", "250 Hz", "315 Hz", "400 Hz", "500 Hz", "630 Hz", "800 Hz", "1000 Hz", "1250 Hz", "1600 Hz", "2000 Hz", "2500 Hz", "3150 Hz", "4000 Hz", "5000 Hz", "6300 Hz", "8000 Hz", "10 kHz", "12,5 kHz", "16 kHz", "20 kHz"],
          datasets: [{
              label: `dB(A)`,
              data: this.dataarray,
              borderColor: '#222222',
              borderWidth: 1,
              backgroundColor: this.colors
            }
          ]
        };
        this.renderChart(this.data, this.options)
    }
  }
}
</script>

<style>
</style>
