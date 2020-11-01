<template>
  <v-card flat color="transparent" >
    <v-card-text>
      <v-row>
        <v-col class="pl-4 pr-0">
          <v-range-slider
            v-model="range"
            v-on:change="$emit('setrange',range)"
            :max="max"
            :min="min"
            :step="step"
            color="red lighten-3"
            track-color="grey"
            hide-details
            class="align-center"
          >
          <!-- <template v-slot:thumb-label="{ value }">
            {{ Math.floor(value/12)+':'+(value%12)/0.2 }}
          </template> -->
          </v-range-slider>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
  export default {
    props: {
      min: Number,
      max: Number,
      width: Number
    },
    data () {
      return {
        step:1,
        range: [this.min,this.max],
      }
    },
    computed: {
      start() {
        return Math.floor(this.range[0]/12)+':'+(this.range[0]%12)/0.2
      }
    },
    mounted () {
    },
  }
</script>
