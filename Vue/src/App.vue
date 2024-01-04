<template>
  <div class="app">
    <Capture></Capture>
  </div>
</template>

<script>
import Capture from './components/Capture.vue';


export default {
  name: 'App',
  components: {
    Capture
  }
}
</script>

<style lang="scss">
* {
  margin: 0px;
  padding: 0px;
}

html,
body,
.app {
  width: 100%;
  height: 100%;
}
</style>
