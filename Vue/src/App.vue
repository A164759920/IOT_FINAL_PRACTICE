<template>
  <div class="app">
    <!-- <HelloWorld></HelloWorld> -->
    <!-- <RaspiClient></RaspiClient> -->
    <Capture></Capture>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
// import RaspiClient from './components/RaspiClient.vue';
import Capture from './components/Capture.vue';


export default {
  name: 'App',
  components: {
    // RaspiClient
    // HelloWorld
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
