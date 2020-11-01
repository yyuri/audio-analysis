<script>
import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins;

export default {
  extends: Line,
  mixins: [ reactiveProp],
  props: {
    range: Array,
    selectable: Boolean,
    options: Object,
    chartData: Object
  },
  data: () => ({
    drag: false,
  }),
  mounted () {
    this.renderChart(this.chartData, this.options)
    this.$emit('chartobject',this.$data._chart)
    this.$data._chart.canvas.addEventListener('pointerdown', this.goToFrame);
  },
  methods: {
    start(e) {
      this.$emit('start',e,this.$data._chart.getElementsAtXAxis(e)[0])
    },
    movement(e) {
      this.$emit('movement',e,this.drag,this.$data._chart.getElementsAtXAxis(e)[0])
    },
    stop() {
      this.$emit('stop')
      this.drag = false;
      this.$data._chart.canvas.removeEventListener('pointerdown', this.handleclick);
      this.$data._chart.canvas.removeEventListener('pointermove', this.movement);
      this.$data._chart.canvas.removeEventListener('pointerup', this.stop);
    },
    goToFrame(e) {
      this.$emit('goToFrame',this.$data._chart.getElementsAtXAxis(e)[0])
    },
  },
  watch: {
    selectable(newval) {
      if(newval) {
        this.drag = true;
        this.$data._chart.canvas.addEventListener('pointerdown', this.start);
        this.$data._chart.canvas.addEventListener('pointermove', this.movement);
        this.$data._chart.canvas.addEventListener('pointerup', this.stop);
      }
    }
  }
}
</script>

<style>
</style>
